import {useParams, Form, Await, useRouteLoaderData} from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo, useState} from 'react';
import {CartForm} from '@shopify/hydrogen';
import {Text, Heading, Section} from '~/components/Text';
import {Link} from '~/components/Link';
import {Cart} from '~/components/Cart';
import {CartLoading} from '~/components/CartLoading';
import {Input} from '~/components/Input';
import {Drawer, useDrawer} from '~/components/Drawer';
import {CountrySelector} from '~/components/CountrySelector';
import {
  IconMenu,
  IconCaret,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
} from '~/components/Icon';
import {useIsHomePath} from '~/lib/utils';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import logo from '../assets/logo.png';
import union from '../assets/Union.png';
import uniondark from '../assets/Uniondark.svg';

import buttonIconNormal from '../assets/buttonIconNormal.svg';
import responsive from '../assets/responsive.svg';
import responsivewhite from '../assets/responsivewhite.svg';
import avatarDefault from '../assets/avatarDefault.svg';

import logosvg from '../assets/logo.svg';
import carticonwhite from '../assets/carticonwhite.svg';

/**
 * @param {LayoutProps}
 */
export function PageLayout({children, layout}) {
  const {headerMenu, footerMenu} = layout || {};
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {headerMenu && layout?.shop.name && (
          <Header title={layout.shop.name} menu={headerMenu} />
        )}
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      {footerMenu && <Footer menu={footerMenu} />}
    </>
  );
}

/**
 * @param {{title: string; menu?: EnhancedMenu}}
 */
function Header({title, menu}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

/**
 * @param {{isOpen: boolean; onClose: () => void}}
 */
function CartDrawer({isOpen, onClose}) {
  const rootData = useRouteLoaderData('root');
  if (!rootData) return null;

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   menu: EnhancedMenu;
 * }}
 */
export function MenuDrawer({isOpen, onClose, menu}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />

        <div className="  nav-color">
          <ul className="px-6 sm:px-8 md:px-12">
            <li>
              <a href="/" className=" hover:text-black">
                About KiT
              </a>
            </li>
            <li>
              <a href="/" className="active hover:text-black">
                Store
              </a>
            </li>
            <li>
              <a href="/" className=" hover:text-black">
                Fanz
              </a>
            </li>
            <li>
              {' '}
              <a href="/" className=" hover:text-black">
                Studio
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Drawer>
  );
}

/**
 * @param {{
 *   menu: EnhancedMenu;
 *   onClose: () => void;
 * }}
 */
function MenuMobileNav({menu, onClose}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({isActive}) =>
              isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))}
    </nav>
  );
}

/**
 * @param {{
 *   title: string;
 *   isHome: boolean;
 *   openCart: () => void;
 *   openMenu: () => void;
 * }}
 */

function MobileHeader({title, isHome, openCart, openMenu}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <>
      <header
        role="banner"
        className={`${
          isHome ? ' shadow-darkHeader' : 'bg-contrast/80 text-primary'
        } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
      >
        <Link
          className="flex items-center self-stretch  justify-center flex-grow logomob"
          to="/"
        >
          <img src={logo} alt="" />
        </Link>
        <div className="flex items-center justify-end w-full ">
          <Form
            method="get"
            action={params.locale ? `/${params.locale}/search` : '/search'}
            className="items-center gap-2 sm:flex"
          >
            <button
              type="submit"
              className="relative flex items-center justify-center w-8 h-8"
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_42_1518"
                  style={{maskType: 'alpha'}}
                  maskUnits="userSpaceOnUse"
                  x={-1}
                  y={0}
                  width={25}
                  height={24}
                >
                  <g clipPath="url(#clip0_42_1518)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.3396 15.3398C13.101 15.3398 15.3396 13.1013 15.3396 10.3398C15.3396 7.57842 13.101 5.33984 10.3396 5.33984C7.57818 5.33984 5.3396 7.57842 5.3396 10.3398C5.3396 13.1013 7.57818 15.3398 10.3396 15.3398ZM10.3396 17.3398C14.2056 17.3398 17.3396 14.2058 17.3396 10.3398C17.3396 6.47385 14.2056 3.33984 10.3396 3.33984C6.47361 3.33984 3.3396 6.47385 3.3396 10.3398C3.3396 14.2058 6.47361 17.3398 10.3396 17.3398Z"
                      fill="#121213"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.9526 20.367L13.1325 14.5469L13.9879 13.9352L14.5467 13.1327L20.3669 18.9528C20.7574 19.3433 20.7574 19.9765 20.3669 20.367C19.9763 20.7576 19.3432 20.7576 18.9526 20.367Z"
                      fill="#121213"
                    />
                  </g>
                </mask>
                <g mask="url(#mask0_42_1518)">
                  <rect
                    x="-0.000244141"
                    width={24}
                    height={24}
                    fill="#121213"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_42_1518">
                    <rect
                      width="24.0001"
                      height={24}
                      fill="white"
                      transform="translate(-0.000244141)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>
            <Input
              className={
                isHome
                  ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                  : 'focus:border-primary/20'
              }
              type="search"
              variant="minisearch"
              placeholder="Search"
              name="q"
            />
          </Form>
          <AccountLink className="relative flex items-center justify-center w-8 h-8" />
          <CartCount className="w-6	" isHome={isHome} openCart={openCart} />
          <button
            onClick={openMenu}
            className="relative flex items-center justify-center w-8 h-8"
          >
            <img className="darkimagecart" src={responsive} alt="" />
            <img className="lightimagecart" src={responsivewhite} alt="" />

            {/* <IconMenu /> */}
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      <header
        role="banner"
        className="lg:hidden top-0 z-10  w-full px-4 py-2 bg-white darkheader backdrop-blur-lg transition duration-300 lg:px-12"
      >
        {/* Mobile Navigation */}
        <nav className="lg:hidden mt-2">
          <div className="flex flex-wrap gap-4 nav-color text-center justify-center">
            <a href="/" className=" active hover:text-black">
              Explore
            </a>
            <a href="/" className="hover:text-black">
              New Release
            </a>
            <a href="/" className="hover:text-black">
              Hot & Best
            </a>
            <a href="/" className="hover:text-black">
              All Albums
            </a>
            <a href="/" className="hover:text-black">
              Event
            </a>
            <div className="flex items-center ">
              <Form
                method="get"
                action={params.locale ? `/${params.locale}/search` : '/search'}
                className="flex items-center gap-2"
              >
                <Input
                  className={
                    isHome
                      ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                      : 'focus:border-primary/20'
                  }
                  type="search"
                  variant="minisearch"
                  placeholder="Search"
                  name="q"
                />
                <button
                  type="submit"
                  className="relative flex items-center justify-center "
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_42_1518"
                      style={{maskType: 'alpha'}}
                      maskUnits="userSpaceOnUse"
                      x={-1}
                      y={0}
                      width={25}
                      height={24}
                    >
                      <g clipPath="url(#clip0_42_1518)">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.3396 15.3398C13.101 15.3398 15.3396 13.1013 15.3396 10.3398C15.3396 7.57842 13.101 5.33984 10.3396 5.33984C7.57818 5.33984 5.3396 7.57842 5.3396 10.3398C5.3396 13.1013 7.57818 15.3398 10.3396 15.3398ZM10.3396 17.3398C14.2056 17.3398 17.3396 14.2058 17.3396 10.3398C17.3396 6.47385 14.2056 3.33984 10.3396 3.33984C6.47361 3.33984 3.3396 6.47385 3.3396 10.3398C3.3396 14.2058 6.47361 17.3398 10.3396 17.3398Z"
                          fill="#121213"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M18.9526 20.367L13.1325 14.5469L13.9879 13.9352L14.5467 13.1327L20.3669 18.9528C20.7574 19.3433 20.7574 19.9765 20.3669 20.367C19.9763 20.7576 19.3432 20.7576 18.9526 20.367Z"
                          fill="#121213"
                        />
                      </g>
                    </mask>
                    <g mask="url(#mask0_42_1518)">
                      <rect
                        x="-0.000244141"
                        width={24}
                        height={24}
                        fill="#121213"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_42_1518">
                        <rect
                          width="24.0001"
                          height={24}
                          fill="white"
                          transform="translate(-0.000244141)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </Form>
              <a href="/" className="text-gray-700 hover:text-black">
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_42_450"
                    style={{maskType: 'alpha'}}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={24}
                    height={24}
                  >
                    <g clipPath="url(#clip0_42_450)">
                      <path
                        d="M10 11.5298C10 12.0821 9.55228 12.5298 9 12.5298C8.44772 12.5298 8 12.0821 8 11.5298C8 10.9775 8.44772 10.5298 9 10.5298C9.55228 10.5298 10 10.9775 10 11.5298Z"
                        fill="#121213"
                      />
                      <path
                        d="M13 11.5298C13 12.0821 12.5523 12.5298 12 12.5298C11.4477 12.5298 11 12.0821 11 11.5298C11 10.9775 11.4477 10.5298 12 10.5298C12.5523 10.5298 13 10.9775 13 11.5298Z"
                        fill="#121213"
                      />
                      <path
                        d="M16 11.5298C16 12.0821 15.5523 12.5298 15 12.5298C14.4477 12.5298 14 12.0821 14 11.5298C14 10.9775 14.4477 10.5298 15 10.5298C15.5523 10.5298 16 10.9775 16 11.5298Z"
                        fill="#121213"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5 13.5V10.5C5 10.2239 4.77614 10 4.5 10C4.22386 10 4 10.2239 4 10.5V13.5C4 13.7761 4.22386 14 4.5 14C4.77614 14 5 13.7761 5 13.5ZM4.5 8C3.11929 8 2 9.11929 2 10.5V13.5C2 14.8807 3.11929 16 4.5 16C5.88071 16 7 14.8807 7 13.5V10.5C7 9.11929 5.88071 8 4.5 8Z"
                        fill="#121213"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 4.01001C7.87058 4.01001 5.92015 7.45252 5.47014 9.25255L3.52986 8.76747C4.07985 6.5675 6.52942 2.01001 12 2.01001C17.4706 2.01001 19.9201 6.5675 20.4701 8.76747L18.5299 9.25255C18.0799 7.45252 16.1294 4.01001 12 4.01001Z"
                        fill="#121213"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M20 13.5V10.5C20 10.2239 19.7761 10 19.5 10C19.2239 10 19 10.2239 19 10.5V13.5C19 13.7761 19.2239 14 19.5 14C19.7761 14 20 13.7761 20 13.5ZM19.5 8C18.1193 8 17 9.11929 17 10.5V13.5C17 14.8807 18.1193 16 19.5 16C20.8807 16 22 14.8807 22 13.5V10.5C22 9.11929 20.8807 8 19.5 8Z"
                        fill="#121213"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.8512 18.2249C16.5892 17.8128 18.159 15.6217 18.5765 14.6165L20.4235 15.3835C19.841 16.7861 17.8108 19.6515 14.1488 20.2026L13.8512 18.2249Z"
                        fill="#121213"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.5 19.0074C12.2239 19.0074 12 19.2313 12 19.5074C12 19.7836 12.2239 20.0074 12.5 20.0074C12.7761 20.0074 13 19.7836 13 19.5074C13 19.2313 12.7761 19.0074 12.5 19.0074ZM10 19.5074C10 18.1267 11.1193 17.0074 12.5 17.0074C13.8807 17.0074 15 18.1267 15 19.5074C15 20.8882 13.8807 22.0074 12.5 22.0074C11.1193 22.0074 10 20.8882 10 19.5074Z"
                        fill="#121213"
                      />
                    </g>
                  </mask>
                  <g mask="url(#mask0_42_450)">
                    <rect width={24} height={24} fill="#121213" />
                  </g>
                  <defs>
                    <clipPath id="clip0_42_450">
                      <rect width="24.0001" height={24} fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>

              <CartCount isHome={isHome} openCart={openCart} />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

/**
 * @param {{
 *   isHome: boolean;
 *   openCart: () => void;
 *   menu?: EnhancedMenu;
 *   title: string;
 * }}
 */
function DesktopHeader({isHome, menu, openCart, title}) {
  const params = useParams();
  const {y} = useWindowScroll();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const [isOpen1, setIsOpen1] = useState(false);

  const toggleDropdown1 = () => {
    setIsOpen1(!isOpen1);
  };

  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };
  return (
    <>
      <header
        role="banner"
        className={`${
          isHome ? 'bg-contrast/80 text-primary' : 'bg-contrast/80 text-primary'
        } ${
          !isHome && y > 50 && ' shadow-lightHeader'
        }  shadow-lightHeader hidden h-nav lg:flex items-center sticky transition duration-300 backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-8 px-12 py-8`}
      >
        <div className="flex gap-12">
          <Link className="font-bold image-logo" to="/">
            <img src={logo} alt="" />
          </Link>

          <nav className="flex gap-8">
            {/* {(menu?.items || []).map((item) => (
            <Link
              key={item.id}
              to={item.to}
              target={item.target}
              prefetch="intent"
              className={({isActive}) =>
                isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
              }
            >
              {item.title}
            </Link>
          ))} */}
            <div className="flex space-x-6 nav-color">
              <a href="/" className=" hover:text-black">
                About KiT
              </a>
              <a href="/" className="active hover:text-black">
                Store
              </a>
              <a href="/" className=" hover:text-black">
                Fanz
              </a>
              <a href="/" className=" hover:text-black">
                Studio
              </a>
            </div>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            {/* Selected Language Button */}
            <button
              onClick={toggleDropdown}
              className="text-blue-600 dark:text-white font-bold focus:outline-none flex gap-2"
            >
              {selectedLanguage}

              <svg
                width={20}
                height={21}
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_68_13915"
                  style={{maskType: 'alpha'}}
                  maskUnits="userSpaceOnUse"
                  x={0}
                  y={0}
                  width={20}
                  height={21}
                >
                  <g clipPath="url(#clip0_68_13915)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.4225 6.99408C16.0971 6.66864 15.5695 6.66864 15.244 6.99408L9.99996 12.2382L4.75587 6.99408C4.43044 6.66864 3.9028 6.66864 3.57736 6.99408C3.25192 7.31951 3.25192 7.84715 3.57736 8.17259L9.4107 14.0059C9.73614 14.3314 10.2638 14.3314 10.5892 14.0059L16.4225 8.17259C16.748 7.84715 16.748 7.31951 16.4225 6.99408Z"
                      fill="#F8F9FD"
                    />
                  </g>
                </mask>
                <g mask="url(#mask0_68_13915)">
                  <rect
                    x="-6.10352e-05"
                    y="0.5"
                    width={20}
                    height={20}
                    fill="#DBDEE8"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_68_13915">
                    <rect
                      width="20.0001"
                      height={20}
                      fill="white"
                      transform="translate(-6.10352e-05 0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <ul className="absolute mt-2  bg-white dark:bg-slate-800 shadow-lg rounded-lg  w-24 text-center">
                <li
                  onClick={() => selectLanguage('EN')}
                  className={`p-2  cursor-pointer ${
                    selectedLanguage === 'EN' ? 'text-blue-600 font-bold' : ''
                  }`}
                >
                  EN
                </li>
                <li
                  onClick={() => selectLanguage('KR')}
                  className={`p-2  cursor-pointer ${
                    selectedLanguage === 'KR' ? 'text-blue-600 font-medium' : ''
                  }`}
                >
                  KR
                </li>
                <li
                  onClick={() => selectLanguage('JP')}
                  className={`p-2  cursor-pointer ${
                    selectedLanguage === 'JP' ? 'text-blue-600 font-medium' : ''
                  }`}
                >
                  JP
                </li>
                <li
                  onClick={() => selectLanguage('CN')}
                  className={`p-2  cursor-pointer ${
                    selectedLanguage === 'CN' ? 'text-blue-600 font-medium' : ''
                  }`}
                >
                  CN
                </li>
              </ul>
            )}
          </div>
          {/* <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" /> */}
          <div className="flex space-x-2">
            <a href="/account" className="loginbutton btn">
              LOG IN
            </a>
            <a href="/" className="registerbutton btn">
              SIGN UP
            </a>
          </div>
        </div>
      </header>
      {/* ----------------------------------------------------------------- */}
      <header
        role="banner"
        className="hidden pt-1 lg:flex items-center sticky transition duration-300 backdrop-blur-lg  top-0 justify-between w-full leading-none gap-8 px-12 "
      >
        <div className="flex gap-12">
          <Link className="font-bold image-logo-1" to="/">
            <img src={logo} alt="" />
          </Link>

          <nav className="flex gap-8">
            <div className="flex space-x-6 nav-color">
              <a href="/" className="active hover:text-black">
                Explore
              </a>
              <a href="/" className="hover:text-black">
                New Release
              </a>
              <a href="/" className="hover:text-black">
                Hot & Best
              </a>
              <a href="/" className="hover:text-black">
                All Albums
              </a>
              <a href="/" className="hover:text-black">
                Event
              </a>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Form
            method="get"
            action={params.locale ? `/${params.locale}/search` : '/search'}
            className="flex items-center gap-2"
          >
            <Input
              className={
                isHome
                  ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                  : 'focus:border-primary/20'
              }
              type="search"
              variant="minisearch"
              placeholder="Search"
              name="q"
            />
            <button
              type="submit"
              className="relative flex items-center justify-center "
            >
              <svg
                width={40}
                height={40}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_6_14854"
                  style={{maskType: 'alpha'}}
                  maskUnits="userSpaceOnUse"
                  x={8}
                  y={8}
                  width={24}
                  height={24}
                >
                  <g clipPath="url(#clip0_6_14854)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.3398 23.3398C21.1013 23.3398 23.3398 21.1013 23.3398 18.3398C23.3398 15.5784 21.1013 13.3398 18.3398 13.3398C15.5784 13.3398 13.3398 15.5784 13.3398 18.3398C13.3398 21.1013 15.5784 23.3398 18.3398 23.3398ZM18.3398 25.3398C22.2058 25.3398 25.3398 22.2058 25.3398 18.3398C25.3398 14.4739 22.2058 11.3398 18.3398 11.3398C14.4739 11.3398 11.3398 14.4739 11.3398 18.3398C11.3398 22.2058 14.4739 25.3398 18.3398 25.3398Z"
                      fill="#121213"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M26.9529 28.367L21.1328 22.5469L21.9882 21.9352L22.547 21.1327L28.3671 26.9528C28.7576 27.3433 28.7576 27.9765 28.3671 28.367C27.9766 28.7576 27.3434 28.7576 26.9529 28.367Z"
                      fill="#121213"
                    />
                  </g>
                </mask>
                <g mask="url(#mask0_6_14854)">
                  <rect x={8} y={8} width={24} height={24} fill="#121213" />
                </g>
                <defs>
                  <clipPath id="clip0_6_14854">
                    <rect
                      width="24.0001"
                      height={24}
                      fill="white"
                      transform="translate(8 8)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </Form>

          
          
          <a href="/" className="text-gray-700 hover:text-black">
            <svg
              width={40}
              height={40}
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_6_14868"
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={8}
                y={8}
                width={24}
                height={24}
              >
                <g clipPath="url(#clip0_6_14868)">
                  <path
                    d="M18 19.5298C18 20.0821 17.5523 20.5298 17 20.5298C16.4477 20.5298 16 20.0821 16 19.5298C16 18.9775 16.4477 18.5298 17 18.5298C17.5523 18.5298 18 18.9775 18 19.5298Z"
                    fill="#121213"
                  />
                  <path
                    d="M21 19.5298C21 20.0821 20.5523 20.5298 20 20.5298C19.4477 20.5298 19 20.0821 19 19.5298C19 18.9775 19.4477 18.5298 20 18.5298C20.5523 18.5298 21 18.9775 21 19.5298Z"
                    fill="#121213"
                  />
                  <path
                    d="M24 19.5298C24 20.0821 23.5523 20.5298 23 20.5298C22.4477 20.5298 22 20.0821 22 19.5298C22 18.9775 22.4477 18.5298 23 18.5298C23.5523 18.5298 24 18.9775 24 19.5298Z"
                    fill="#121213"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13 21.5V18.5C13 18.2239 12.7761 18 12.5 18C12.2239 18 12 18.2239 12 18.5V21.5C12 21.7761 12.2239 22 12.5 22C12.7761 22 13 21.7761 13 21.5ZM12.5 16C11.1193 16 10 17.1193 10 18.5V21.5C10 22.8807 11.1193 24 12.5 24C13.8807 24 15 22.8807 15 21.5V18.5C15 17.1193 13.8807 16 12.5 16Z"
                    fill="#121213"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20 12.01C15.8706 12.01 13.9201 15.4525 13.4701 17.2525L11.5299 16.7675C12.0799 14.5675 14.5294 10.01 20 10.01C25.4706 10.01 27.9201 14.5675 28.4701 16.7675L26.5299 17.2525C26.0799 15.4525 24.1294 12.01 20 12.01Z"
                    fill="#121213"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M28 21.5V18.5C28 18.2239 27.7761 18 27.5 18C27.2239 18 27 18.2239 27 18.5V21.5C27 21.7761 27.2239 22 27.5 22C27.7761 22 28 21.7761 28 21.5ZM27.5 16C26.1193 16 25 17.1193 25 18.5V21.5C25 22.8807 26.1193 24 27.5 24C28.8807 24 30 22.8807 30 21.5V18.5C30 17.1193 28.8807 16 27.5 16Z"
                    fill="#121213"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21.8512 26.2249C24.5892 25.8128 26.159 23.6217 26.5765 22.6165L28.4235 23.3835C27.841 24.7861 25.8108 27.6515 22.1488 28.2026L21.8512 26.2249Z"
                    fill="#121213"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.5 27.0074C20.2239 27.0074 20 27.2313 20 27.5074C20 27.7836 20.2239 28.0074 20.5 28.0074C20.7761 28.0074 21 27.7836 21 27.5074C21 27.2313 20.7761 27.0074 20.5 27.0074ZM18 27.5074C18 26.1267 19.1193 25.0074 20.5 25.0074C21.8807 25.0074 23 26.1267 23 27.5074C23 28.8882 21.8807 30.0074 20.5 30.0074C19.1193 30.0074 18 28.8882 18 27.5074Z"
                    fill="#121213"
                  />
                </g>
              </mask>
              <g mask="url(#mask0_6_14868)">
                <rect x={8} y={8} width={24} height={24} fill="#121213" />
              </g>
              <defs>
                <clipPath id="clip0_6_14868">
                  <rect
                    width="24.0001"
                    height={24}
                    fill="white"
                    transform="translate(8 8)"
                  />
                </clipPath>
              </defs>
            </svg>
          </a>

          <CartCount isHome={isHome} openCart={openCart} />
          {/* 
          <a href="/" className="text-gray-700 hover:text-black">
            <svg
              width={40}
              height={40}
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_6_14882"
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={8}
                y={8}
                width={24}
                height={24}
              >
                <g clipPath="url(#clip0_6_14882)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.3823 16.5905V27.9177H25.6181V16.5905H14.3823ZM13.3823 14.5905C12.83 14.5905 12.3823 15.0382 12.3823 15.5905V28.9177C12.3823 29.47 12.83 29.9177 13.3823 29.9177H26.6181C27.1704 29.9177 27.6181 29.47 27.6181 28.9177V15.5905C27.6181 15.0382 27.1704 14.5905 26.6181 14.5905H13.3823Z"
                    fill="#121213"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.0002 12.4561C18.8554 12.4561 17.9273 13.3841 17.9273 14.529V17.736C17.9273 18.2883 17.4796 18.736 16.9273 18.736C16.375 18.736 15.9273 18.2883 15.9273 17.736V14.529C15.9273 12.2796 17.7508 10.4561 20.0002 10.4561C22.2496 10.4561 24.0731 12.2796 24.0731 14.529V17.736C24.0731 18.2883 23.6254 18.736 23.0731 18.736C22.5208 18.736 22.0731 18.2883 22.0731 17.736V14.529C22.0731 13.3841 21.145 12.4561 20.0002 12.4561Z"
                    fill="#121213"
                  />
                </g>
              </mask>
              <g mask="url(#mask0_6_14882)">
                <rect x={8} y={8} width={24} height={24} fill="#121213" />
              </g>
              <defs>
                <clipPath id="clip0_6_14882">
                  <rect
                    width="24.0001"
                    height={24}
                    fill="white"
                    transform="translate(8 8)"
                  />
                </clipPath>
              </defs>
            </svg>
          </a> */}
        </div>
      </header>
    </>
  );
}

/**
 * @param {{className?: string}}
 */
function AccountLink({className}) {
  const rootData = useRouteLoaderData('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={className}>
      <Suspense fallback={<IconLogin />}>
        <Await resolve={isLoggedIn} errorElement={<IconLogin />}>
          {(isLoggedIn) =>
            isLoggedIn ? (
              <IconAccount />
            ) : (
              // <IconLogin />
              <img className="w-6	" src={avatarDefault} alt="" />
            )
          }
        </Await>
      </Suspense>
    </Link>
  );
}

/**
 * @param {{
 *   isHome: boolean;
 *   openCart: () => void;
 * }}
 */
function CartCount({isHome, openCart}) {
  const rootData = useRouteLoaderData('root');
  if (!rootData) return null;

  return (
    <Suspense fallback={<Badge count={0} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Badge openCart={openCart} count={cart?.totalQuantity || 0} />
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   count: number;
 *   dark: boolean;
 *   openCart: () => void;
 * }}
 */
function Badge({openCart, dark, count}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <img className="darkimagecart" src={buttonIconNormal} alt="" />

        <img className="lightimagecart" src={carticonwhite} alt="" />

        {/* <svg
          width={40}
          height={40}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="mask0_6_14882"
            style={{maskType: 'alpha'}}
            maskUnits="userSpaceOnUse"
            x={8}
            y={8}
            width={24}
            height={24}
          >
            <g clipPath="url(#clip0_6_14882)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3823 16.5905V27.9177H25.6181V16.5905H14.3823ZM13.3823 14.5905C12.83 14.5905 12.3823 15.0382 12.3823 15.5905V28.9177C12.3823 29.47 12.83 29.9177 13.3823 29.9177H26.6181C27.1704 29.9177 27.6181 29.47 27.6181 28.9177V15.5905C27.6181 15.0382 27.1704 14.5905 26.6181 14.5905H13.3823Z"
                fill="#121213"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.0002 12.4561C18.8554 12.4561 17.9273 13.3841 17.9273 14.529V17.736C17.9273 18.2883 17.4796 18.736 16.9273 18.736C16.375 18.736 15.9273 18.2883 15.9273 17.736V14.529C15.9273 12.2796 17.7508 10.4561 20.0002 10.4561C22.2496 10.4561 24.0731 12.2796 24.0731 14.529V17.736C24.0731 18.2883 23.6254 18.736 23.0731 18.736C22.5208 18.736 22.0731 18.2883 22.0731 17.736V14.529C22.0731 13.3841 21.145 12.4561 20.0002 12.4561Z"
                fill="#121213"
              />
            </g>
          </mask>
          <g mask="url(#mask0_6_14882)">
            <rect x={8} y={8} width={24} height={24} fill="#121213" />
          </g>
          <defs>
            <clipPath id="clip0_6_14882">
              <rect
                width="24.0001"
                height={24}
                fill="white"
                transform="translate(8 8)"
              />
            </clipPath>
          </defs>
        </svg> */}

        <div
          className={`${
            dark
              ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
              : 'text-contrast bg-primary'
          } absolute bottom-0 right-0 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center  focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

/**
 * @param {{menu?: EnhancedMenu}}
 */
function Footer({menu}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    // <Section
    //   divider={isHome ? 'none' : 'top'}
    //   as="footer"
    //   role="contentinfo"
    //   className={`grid min-h-[25rem] items-start grid-flow-row w-full gap-6 py-8 px-6 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsCount}
    //     bg-primary dark:bg-contrast dark:text-primary text-contrast overflow-hidden`}
    // >
    //   <FooterMenu menu={menu} />
    //   <CountrySelector />
    //   <div
    //     className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
    //   >
    //     &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
    //     Licensed Open Source project.
    //   </div>
    // </Section>

    <>
      <Section className="bg-gray-100 dark:bg-transparent	 py-6">
        <footer className="">
          <div className="">
            <div className="text-md  text-gray-500 textfooter lg:flex  gap-10 items-center mb-5  ">
              <img src={union} alt="Logo" className=" darkimagecart" />
              <img src={uniondark} alt="Logo" className="w-12	lightimagecart" />

              <div className="lg:gap-10 gap-4 flex  flex-wrap mt-6 lg:mt-0">
                <a href="#" className=" font-bold hover:underline">
                  Company
                </a>
                <a href="#" className="font-bold hover:underline">
                  Contact
                </a>
                <a href="#" className="font-bold hover:underline">
                  Careers
                </a>
                <a href="#" className="font-bold hover:underline">
                  Download
                </a>
              </div>
            </div>
            <div className="flex flex-wrap  justify-between items-start  bordertopfooter	  border-t border-gray-300 pt-4">
              <div className="text-innner-footer order-2 lg:order-1 mt-6 lg:mt-0">
                <p>Muzlive Inc.</p>
                <p>
                  Address: 19, World Cup Buk-ro 56-gil, Mapo-gu, Seoul 10F
                  MUZLIVE
                </p>
                <p>Phone no.: 010-9956-1972</p>
                <p>Business Registration No.: 724-86-00298</p>
                <p>E-Commerce Business Licence No.: 2019-Seoul Mapo-1309</p>
                <p>CEO: Chul Seok</p>
                <p>Personal Information Manager: Jason Park</p>
              </div>
              <div className="flex space-x-4 text-innner-footer font-semibold	order-1">
                <a href="#" className="hover:underline">
                  Terms & conditions
                </a>
                <a href="#" className="hover:underline">
                  Privacy policy
                </a>
              </div>
            </div>
            <div className="flex flex-wrap  justify-between items-center mt-8 bordertopfooter	 border-t border-gray-300 pt-4">
              <p className="text-sm text-gray-600 order-2 lg:order-1 mt-6 lg:mt-0">
                &copy; 2024 Muzlive, Inc. All Rights Reserved
              </p>

              <div className="flex space-x-4 order-1">
                <a
                  href="https://youtube.com"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg
                    width={32}
                    height={32}
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_1_29439)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.9998 29.3337C23.3636 29.3337 29.3331 23.3641 29.3331 16.0003C29.3331 8.63653 23.3636 2.66699 15.9998 2.66699C8.63602 2.66699 2.6665 8.63653 2.6665 16.0003C2.6665 23.3641 8.63602 29.3337 15.9998 29.3337ZM15.9875 22.1681H16.0051C16.2303 22.1681 21.5371 22.1646 22.8741 21.8101C23.6308 21.6057 24.2223 21.0155 24.4284 20.2593C24.6792 18.8628 24.8023 17.4463 24.7961 16.0275C24.8134 14.6027 24.6936 13.1797 24.4381 11.778C24.2336 11.0224 23.6436 10.4321 22.8882 10.2272C21.5257 9.85333 16.0553 9.84277 15.9999 9.84277H15.9814C15.7562 9.84277 10.4503 9.84277 9.1115 10.1946C8.35575 10.411 7.76717 11.0052 7.55808 11.763C7.30765 13.1614 7.18488 14.5796 7.19128 16.0002C7.18132 17.4185 7.30086 18.8347 7.5484 20.2312C7.7519 20.9883 8.34308 21.5798 9.10007 21.7837C10.4767 22.1576 15.933 22.1681 15.9875 22.1681ZM14.2415 18.6435L14.2459 13.3657L18.8261 16.0046L14.2415 18.6435Z"
                        fill="#A5A9B6"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_29439">
                        <rect
                          width={32}
                          height={32}
                          fill="white"
                          transform="translate(0 0.000305176)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </a>

                <a
                  href="https://instagram.com"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg
                    width={32}
                    height={32}
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_1_29441)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.1956 2.86261C8.83182 2.86261 2.8623 8.83215 2.8623 16.1959C2.8623 23.5597 8.83182 29.5293 16.1956 29.5293C23.5594 29.5293 29.5289 23.5597 29.5289 16.1959C29.5289 8.83215 23.5594 2.86261 16.1956 2.86261ZM16.0003 13.2225C14.4662 13.2225 13.2229 14.4665 13.2229 16.0006C13.2229 17.5348 14.4662 18.7787 16.0003 18.7787C17.5344 18.7787 18.7784 17.5348 18.7784 16.0006C18.7784 14.4665 17.5344 13.2225 16.0003 13.2225ZM16.0003 20.2799C13.6369 20.2799 11.7211 18.3641 11.7211 16.0006C11.7211 13.6372 13.6369 11.7214 16.0003 11.7214C18.3637 11.7214 20.2795 13.6372 20.2795 16.0006C20.2795 18.3641 18.3637 20.2799 16.0003 20.2799ZM19.6172 12.1074C19.5074 11.9429 19.4488 11.7495 19.4489 11.5517C19.4491 11.2866 19.5546 11.0324 19.7421 10.845C19.9296 10.6576 20.1838 10.5522 20.4489 10.5521C20.6467 10.5522 20.8404 10.6109 21.0049 10.7208C21.1693 10.8308 21.2974 10.987 21.373 11.1698C21.4486 11.3526 21.4683 11.5536 21.4297 11.7476C21.391 11.9416 21.2957 12.1197 21.1558 12.2595C21.0159 12.3993 20.8376 12.4945 20.6436 12.533C20.4496 12.5715 20.2486 12.5517 20.0659 12.4759C19.8832 12.4001 19.727 12.2719 19.6172 12.1074ZM11.0859 22.4974C11.3794 22.6117 11.821 22.747 12.6335 22.784C13.5117 22.8244 13.7748 22.8325 16.0003 22.8325C18.2258 22.8325 18.4897 22.8244 19.3681 22.784C20.1806 22.7471 20.6223 22.6118 20.9157 22.4974C21.3048 22.3459 21.5828 22.1652 21.8742 21.874C22.1657 21.5828 22.3461 21.3052 22.4976 20.9161C22.6113 20.6226 22.7473 20.181 22.7843 19.3685C22.8247 18.4893 22.8327 18.2262 22.8327 16.0007C22.8327 13.7752 22.8247 13.5121 22.7843 12.6329C22.7473 11.8204 22.612 11.3787 22.4976 11.0853C22.3461 10.6962 22.1661 10.4182 21.8742 10.1267C21.5824 9.83526 21.3048 9.65418 20.9157 9.50338C20.6215 9.39004 20.1806 9.2537 19.3681 9.2167C18.4889 9.17697 18.2248 9.16823 16.0003 9.16823C13.7758 9.16823 13.5119 9.1763 12.6335 9.2167C11.821 9.25363 11.3793 9.38897 11.0859 9.50338C10.6962 9.65418 10.4188 9.83486 10.1273 10.1267C9.83587 10.4186 9.65546 10.6962 9.50399 11.0853C9.39065 11.3795 9.25431 11.8204 9.21731 12.6329C9.17758 13.5121 9.16884 13.7752 9.16884 16.0007C9.16884 18.2262 9.17691 18.4901 9.21731 19.3685C9.25424 20.181 9.38958 20.6228 9.50399 20.9161C9.65479 21.3052 9.83547 21.5825 10.1273 21.874C10.4192 22.1655 10.6968 22.3459 11.0859 22.4974ZM10.5417 8.10452C11.0711 7.89851 11.6773 7.75784 12.5645 7.71744C13.4535 7.67637 13.7378 7.66697 16.001 7.66697C18.2641 7.66697 18.5482 7.67704 19.4368 7.71744C20.3233 7.75717 20.9291 7.89851 21.4596 8.10452C22.0069 8.31726 22.4721 8.60194 22.9352 9.06576C23.3982 9.52958 23.683 9.99406 23.8964 10.542C24.1024 11.0714 24.2431 11.6776 24.2835 12.5648C24.3239 13.4534 24.3333 13.7375 24.3333 16.0006C24.3333 18.2638 24.3239 18.5472 24.2835 19.4364C24.2437 20.3236 24.1024 20.9295 23.8964 21.4593C23.683 22.0072 23.399 22.4724 22.9352 22.9355C22.4713 23.3986 22.0069 23.6834 21.4589 23.8968C20.9291 24.1028 20.3233 24.2434 19.4361 24.2838C18.5475 24.3249 18.2634 24.3343 16.0003 24.3343C13.7371 24.3343 13.4535 24.3242 12.5645 24.2838C11.6773 24.2434 11.0721 24.1028 10.5417 23.8968C9.99341 23.6834 9.52919 23.3984 9.06544 22.9355C8.60169 22.4726 8.31694 22.0072 8.1042 21.4593C7.89819 20.9295 7.75752 20.3237 7.71712 19.4364C7.67605 18.5479 7.66665 18.2638 7.66665 16.0006C7.66665 13.7375 7.67605 13.4534 7.71712 12.5648C7.75752 11.6777 7.89819 11.0718 8.1042 10.542C8.31694 9.99373 8.60162 9.52885 9.06544 9.06576C9.52925 8.60268 9.99341 8.31726 10.5417 8.10452Z"
                        fill="#A5A9B6"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_29441">
                        <rect
                          width={32}
                          height={32}
                          fill="white"
                          transform="translate(0 0.000305176)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </a>

                <a
                  href="https://x.com"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg
                    width={32}
                    height={32}
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.7033 15.557V11.3958H15.2723L16.7049 13.5029V11.3958H18.2964V15.557H16.7049L15.2723 13.5029V15.557H13.7033Z"
                      fill="#A5A9B6"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.9998 29.3337C23.3638 29.3337 29.3332 23.3643 29.3332 16.0003C29.3332 8.63639 23.3638 2.66699 15.9998 2.66699C8.63591 2.66699 2.6665 8.63639 2.6665 16.0003C2.6665 23.3643 8.63591 29.3337 15.9998 29.3337ZM10.6639 18.6722V8.00033H21.3358V18.6722H10.6639ZM18.9484 22.1982L21.3358 19.6214H10.6639L13.0666 22.1982H18.9484ZM16.0529 25.4635L18.0311 23.1139H13.9686L16.0529 25.4635Z"
                      fill="#A5A9B6"
                    />
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg
                    width={32}
                    height={32}
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_1_29445)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.9998 29.3337C23.3636 29.3337 29.3331 23.3641 29.3331 16.0003C29.3331 8.63653 23.3636 2.66699 15.9998 2.66699C8.63602 2.66699 2.6665 8.63653 2.6665 16.0003C2.6665 23.3641 8.63602 29.3337 15.9998 29.3337ZM22.2876 9.11947L17.2796 14.9408L22.726 22.8675H18.7202L15.0524 17.5297L10.4604 22.8675H9.27362L14.5256 16.7629L9.27362 9.11947H13.2794L16.7524 14.1741L21.1008 9.11947H22.2876ZM19.2786 22.0147H21.1014L12.7109 10.0129H10.888L19.2786 22.0147Z"
                        fill="#A5A9B6"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_29445">
                        <rect
                          width={32}
                          height={32}
                          fill="white"
                          transform="translate(0 0.000305176)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
                <a href="">
                  <svg
                    width={27}
                    height={28}
                    viewBox="0 0 27 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_1_29448)">
                      <g clipPath="url(#clip1_1_29448)">
                        <path
                          d="M26.2719 14.0053C26.2719 6.64057 20.5407 0.670288 13.4709 0.670288C6.40112 0.670288 0.669922 6.64057 0.669922 14.0053C0.669922 20.6611 5.35104 26.1779 11.4708 27.1783V17.8599H8.22051V14.0053H11.4708V11.0674C11.4708 7.72534 13.3819 5.87927 16.3059 5.87927C17.706 5.87927 19.1714 6.13972 19.1714 6.13972V9.42138H17.5572C15.9671 9.42138 15.4711 10.4494 15.4711 11.505V14.0053H19.0214L18.4538 17.8599H15.4711V27.1783C21.5908 26.1779 26.2719 20.6611 26.2719 14.0053Z"
                          fill="#A5A9B6"
                        />
                      </g>
                    </g>
                    <defs>
                      <clipPath id="clip0_1_29448">
                        <rect
                          width="25.6021"
                          height="26.67"
                          fill="white"
                          transform="translate(0.669922 0.670288)"
                        />
                      </clipPath>
                      <clipPath id="clip1_1_29448">
                        <rect
                          width="25.602"
                          height="26.67"
                          fill="white"
                          transform="translate(0.669922 0.670288)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </Section>
    </>
  );
}

/**
 * @param {{item: ChildEnhancedMenuItem}}
 */
function FooterLink({item}) {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
}

/**
 * @param {{menu?: EnhancedMenu}}
 */
function FooterMenu({menu}) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between" size="lead" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${
                      open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                    } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}

/**
 * @typedef {{
 *   children: React.ReactNode;
 *   layout?: LayoutQuery & {
 *     headerMenu?: EnhancedMenu | null;
 *     footerMenu?: EnhancedMenu | null;
 *   };
 * }} LayoutProps
 */

/** @typedef {import('storefrontapi.generated').LayoutQuery} LayoutQuery */
/** @typedef {import('~/lib/utils').EnhancedMenu} EnhancedMenu */
/** @typedef {import('~/lib/utils').ChildEnhancedMenuItem} ChildEnhancedMenuItem */
/** @typedef {import('~/root').RootLoader} RootLoader */
