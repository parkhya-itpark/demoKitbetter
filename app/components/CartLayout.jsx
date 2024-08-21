import {useParams, Form, Await, useRouteLoaderData} from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo} from 'react';
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

/**
 * @param {LayoutProps}
 */
export function CartLayout({children, layout}) {
  const {headerMenu, footerMenu} = layout || {};
  return (
    <>
      {headerMenu && layout?.shop.name && (
        <Header title={layout.shop.name} menu={headerMenu} />
      )}
    </>
  );
}

/**
 * @param {{title: string; menu?: EnhancedMenu}}
 */
export function Header({title, menu}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
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

      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
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

function DesktopHeader({isHome, menu, openCart, title}) {
  const params = useParams();
  const {y} = useWindowScroll();
  return (
    <header>
      <div className="flex justify-end">
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
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
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
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
        {/* <IconBag /> */}
        <svg
          width="20"
          height="23"
          viewBox="0 0 29 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.56641 9.14831H3.89113C3.37214 9.14831 2.9394 9.54534 2.89483 10.0624L1.20299 29.6866C1.15264 30.2706 1.61312 30.7725 2.1993 30.7725H26.1191C26.7052 30.7725 27.1657 30.2706 27.1154 29.6866L25.4235 10.0624C25.379 9.54534 24.9462 9.14831 24.4272 9.14831H19.752M8.56641 9.14831V3.94025C8.56641 2.83568 9.46184 1.94025 10.5664 1.94025H17.752C18.8565 1.94025 19.752 2.83568 19.752 3.94025V9.14831M8.56641 9.14831H19.752"
            stroke="white"
            strokeOpacity="0.9"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <div className="cart-badge">
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button onClick={openCart} className="button-cart ">
      {BadgeCounter}
      Cart
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
