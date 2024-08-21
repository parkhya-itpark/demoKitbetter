import {useRef, Suspense, useState} from 'react';
import {Disclosure, Listbox} from '@headlessui/react';
import {defer, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Await, useNavigate} from '@remix-run/react';
import {
  getSeoMeta,
  Money,
  ShopPayButton,
  VariantSelector,
  getSelectedProductOptions,
  Analytics,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import {Heading, Section, Text} from '~/components/Text';
import {Link} from '~/components/Link';
import {Button} from '~/components/Button';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Skeleton} from '~/components/Skeleton';
import {ProductSwimlane} from '~/components/ProductSwimlane';
import {ProductGallery} from '~/components/ProductGallery';
import {IconCaret, IconCheck, IconClose} from '~/components/Icon';
import {getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {Header} from '~/components/CartLayout';

export const headers = routeHeaders;

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const {productHandle} = args.params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Fetch collections data
  const collections = await args.context.storefront.query(COLLECTIONS_QUERY, {
    variables: {
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
      first: 10, // Adjust this number as needed
    },
  });
  

  return defer({
    ...deferredData,
    ...criticalData,
    collections,
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({params, request, context}) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const selectedOptions = getSelectedProductOptions(request);

  const [{shop, product}] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: productHandle,
        selectedOptions,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  if (!product.selectedVariant) {
    throw redirectToFirstVariant({product, request});
  }

  const recommended = getRecommendedProducts(context.storefront, product.id);

  // TODO: firstVariant is never used because we will always have a selectedVariant due to redirect
  // Investigate if we can avoid the redirect for product pages with no search params for first variant
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const seo = seoPayload.product({
    product,
    selectedVariant,
    url: request.url,
  });

  return {
    product,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    seo,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({params, context}) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deferred query resolves, the UI will update.
  const variants = context.storefront.query(VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  return {variants};
}

/**
 * @param {Class<loader>>}
 */
export const meta = ({matches}) => {
  return getSeoMeta(...matches.map((match) => match.data.seo));
};

/**
 * @param {{
 *   product: ProductQuery['product'];
 *   request: Request;
 * }}
 */
function redirectToFirstVariant({product, request}) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const firstVariant = product.variants.nodes[0];
  for (const option of firstVariant.selectedOptions) {
    searchParams.set(option.name, option.value);
  }

  url.search = searchParams.toString();

  return redirect(url.href.replace(url.origin, ''), 302);
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const [isOpen, setIsOpen] = useState(false);

  const openNav = () => {
    setIsOpen(true);
  };

  const closeNav = () => {
    setIsOpen(false);
  };
  const {product, shop, recommended, variants, collections} = useLoaderData();
  const {media, title, vendor, descriptionHtml, id, metafield} = product;
  let artistName = product?.metafield?.value;
  const previewAudio = product?.metafieldPreviewAudio?.reference?.sources || [];

  if (artistName && artistName.startsWith('["') && artistName.endsWith('"]')) {
    artistName = artistName.slice(2, -2); // Remove the [" and "] from the string
  }
  const {shippingPolicy, refundPolicy} = shop;

  return (
    <>
      <Section className="">
        <div className="flex justify-between lg:justify-end items-center">
          <div className="lg:hidden md-hidden">
            <div
              id="mySidenav"
              className="sidenav"
              style={{width: isOpen ? '200px' : '0'}}
            >
              <a
                href="javascript:void(0)"
                className="closebtn"
                onClick={closeNav}
              >
                &times;
              </a>
              <div className="collection-length">
                <div className="mb-4">
                  <h2>All album </h2>

                  <Link to="/" className="static-link">
                    <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                      All
                    </h3>
                  </Link>
                  <div className="collections-section">
                    {collections?.collections?.nodes?.map((collection, i) => (
                      <Link
                        prefetch="viewport"
                        to={`/collections/${collection.handle}`}
                        className="grid gap-4"
                        key={i}
                      >
                        <Heading as="h3" size="copy">
                          {collection.title}
                        </Heading>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h2>Event</h2>
                </div>
                <div className="mb-4">
                  <h2>Review</h2>
                </div>
                <div className="mb-4">
                  <h2>Helpdesk</h2>
                  <Link to="/collections" className="static-link">
                    <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                      Notice
                    </h3>
                  </Link>
                  <Link to="/collections" className="static-link">
                    <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                      FAQ
                    </h3>
                  </Link>
                  <Link to="/collections" className="static-link">
                    <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                      Q&A
                    </h3>
                  </Link>
                </div>
              </div>
            </div>
            <span
              style={{fontSize: '30px', cursor: 'pointer'}}
              onClick={openNav}
            >
              <svg
                width="21"
                height="18"
                viewBox="0 0 21 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.291992"
                  y="0.42865"
                  width="20.0322"
                  height="1.96191"
                  fill="black"
                />
                <rect
                  x="0.291992"
                  y="8.17291"
                  width="20.0322"
                  height="1.96191"
                  fill="black"
                />
                <rect
                  x="0.291992"
                  y="15.9168"
                  width="20.0322"
                  height="1.96191"
                  fill="black"
                />
              </svg>
              {/* open */}
            </span>
          </div>
          <Header />
        </div>
      </Section>

      <Section>
        <div className="row relative">
          <div className="col-sm-3">
            <div className="collection-length">
              <div className="mb-4">
                <h2>All album </h2>

                <Link to="/" className="static-link">
                  <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                    All
                  </h3>
                </Link>
                <div className="collections-section">
                  {collections?.collections?.nodes?.map((collection, i) => (
                    <Link
                      prefetch="viewport"
                      to={`/collections/${collection.handle}`}
                      className="grid gap-4"
                      key={i}
                    >
                      <Heading as="h3" size="copy">
                        {collection.title}
                      </Heading>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h2>Event</h2>
              </div>
              <div className="mb-4">
                <h2>Review</h2>
              </div>
              <div className="mb-4">
                <h2>Helpdesk</h2>
                <Link to="/collections" className="static-link">
                  <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                    Notice
                  </h3>
                </Link>
                <Link to="/collections" className="static-link">
                  <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                    FAQ
                  </h3>
                </Link>
                <Link to="/collections" className="static-link">
                  <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                    Q&A
                  </h3>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-sm-9">
            {/* <div className="grid items-start md:gap-6  md:grid-cols-2 lg:grid-cols-3"> */}

            <div className="row">
              <div className="col-sm-6">
                <ProductGallery
                  media={media.nodes}
                  className="w-full lg:col-span-2"
                />
              </div>
              <div className="col-sm-5">
                <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:h-screen md:pt-nav hiddenScroll md:overflow-y-scroll">
                  <section
                    // className="flex flex-col w-full max-w-xl gap-8 p-6 md:mx-auto md:max-w-sm md:px-0"
                    className="flex flex-col  gap-8 lg:p-6 pt-4"
                  >
                    <div className="grid gap-2">
                      <h3 className="product-detail-name">{title}</h3>

                      {/* <Heading as="h4" className="whitespace-normal">
                        {title}
                      </Heading> */}
                      {vendor && (
                        <Text className={'opacity-50 font-medium'}>
                          {vendor}
                        </Text>
                      )}
                      <p>{artistName}</p>
                    </div>
                    <Suspense fallback={<ProductForm variants={[]} />}>
                      <Await
                        errorElement="There was a problem loading related products"
                        resolve={variants}
                      >
                        {(resp) => (
                          <ProductForm
                            variants={resp.product?.variants.nodes || []}
                          />
                        )}
                      </Await>
                    </Suspense>

                    {previewAudio.length > 0 && (
                      <div>
                        <video controls>
                          {previewAudio.map((source, index) => (
                            <source
                              key={index}
                              src={source.url}
                              type={source.mimeType}
                            />
                          ))}
                        </video>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>

            {/* </div> */}
            <div className="grid gap-4 py-4">
              {descriptionHtml && (
                <ProductDetail title="Description" content={descriptionHtml} />
              )}
              {shippingPolicy?.body && (
                <ProductDetail
                  title="Shipping"
                  content={getExcerpt(shippingPolicy.body)}
                  learnMore={`/policies/${shippingPolicy.handle}`}
                />
              )}
              {refundPolicy?.body && (
                <ProductDetail
                  title="Returns"
                  content={getExcerpt(refundPolicy.body)}
                  learnMore={`/policies/${refundPolicy.handle}`}
                />
              )}
            </div>
            <Suspense fallback={<Skeleton className="h-32" />}>
              <Await
                errorElement="There was a problem loading related products"
                resolve={recommended}
              >
                {(products) => (
                  <div className="bad-box">
                    <ProductSwimlane
                      title="Albums you may also like"
                      products={products}
                      prevClassName="swiper-button-prev-1"
                      nextClassName="swiper-button-next-1"
                    />
                  </div>
                )}
              </Await>
              <Await
                errorElement="There was a problem loading related products"
                resolve={recommended}
              >
                {(products) => (
                  <div className="bad-box">
                    <ProductSwimlane
                      title="More from this artist"
                      products={products}
                      prevClassName="swiper-button-prev-2"
                      nextClassName="swiper-button-next-2"
                    />
                  </div>
                )}
              </Await>
              <Await
                errorElement="There was a problem loading related products"
                resolve={recommended}
              >
                {(products) => (
                  <div className="bad-box">
                    <ProductSwimlane
                      title="Recently viewed"
                      products={products}
                      prevClassName="swiper-button-prev-3"
                      nextClassName="swiper-button-next-3"
                    />
                  </div>
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </Section>
      <Section className="px-0 md:px-8 lg:px-12"></Section>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: product.selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: product.selectedVariant?.id || '',
              variantTitle: product.selectedVariant?.title || '',
              quantity: product.quantity,
            },
          ],
        }}
      />
    </>
  );
}

/**
 * @param {{
 *   variants: ProductVariantFragmentFragment[];
 * }}
 */
export function ProductForm({variants}) {
  /** @type {LoaderReturnData} */
  const {product, storeDomain} = useLoaderData();

  const closeRef = useRef(null);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1); // Add state for quantity

  const handleQuantityChange = (increment) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + increment));
  };

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <VariantSelector
          handle={product.handle}
          options={product.options.filter((option) => option.values.length > 1)}
          variants={variants}
        >
          {({option}) => {
            return (
              <div
                key={option.name}
                className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
              >
                <Heading as="legend" size="lead" className="min-w-[4rem]">
                  {option.name}
                </Heading>
                <div className="flex flex-wrap items-baseline gap-4">
                  {option.values.length > 7 ? (
                    <div className="relative w-full">
                      <Listbox
                        onChange={(selectedOption) => {
                          const value = option.values.find(
                            (v) => v.value === selectedOption,
                          );

                          if (value) {
                            navigate(value.to);
                          }
                        }}
                      >
                        {({open}) => (
                          <>
                            <Listbox.Button
                              ref={closeRef}
                              className={clsx(
                                'flex items-center justify-between w-full py-3 px-4 border border-primary',
                                open
                                  ? 'rounded-b md:rounded-t md:rounded-b-none'
                                  : 'rounded',
                              )}
                            >
                              <span>{option.value}</span>
                              <IconCaret direction={open ? 'up' : 'down'} />
                            </Listbox.Button>
                            <Listbox.Options
                              className={clsx(
                                'border-primary bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                                open ? 'max-h-48' : 'max-h-0',
                              )}
                            >
                              {option.values
                                .filter((value) => value.isAvailable)
                                .map(({value, to, isActive}) => (
                                  <Listbox.Option
                                    key={`option-${option.name}-${value}`}
                                    value={value}
                                  >
                                    {({active}) => (
                                      <Link
                                        to={to}
                                        preventScrollReset
                                        className={clsx(
                                          'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                          active && 'bg-primary/10',
                                        )}
                                        onClick={() => {
                                          if (!closeRef?.current) return;
                                          closeRef.current.click();
                                        }}
                                      >
                                        {value}
                                        {isActive && (
                                          <span className="ml-2">
                                            <IconCheck />
                                          </span>
                                        )}
                                      </Link>
                                    )}
                                  </Listbox.Option>
                                ))}
                            </Listbox.Options>
                          </>
                        )}
                      </Listbox>
                    </div>
                  ) : (
                    option.values.map(({value, isAvailable, isActive, to}) => (
                      <Link
                        key={option.name + value}
                        to={to}
                        preventScrollReset
                        prefetch="intent"
                        replace
                        className={clsx(
                          'leading-none py-1 border-b-[1.5px] cursor-pointer transition-all duration-200',
                          isActive ? 'border-primary/50' : 'border-primary/0',
                          isAvailable ? 'opacity-100' : 'opacity-50',
                        )}
                      >
                        {value}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          }}
        </VariantSelector>
        {selectedVariant && (
          <div className="grid items-stretch gap-4">
            {isOutOfStock ? (
              <Button variant="secondary" disabled>
                <Text>Sold out</Text>
              </Button>
            ) : (
              <>
                <div className="flex gap-4">
                  <Money
                    withoutTrailingZeros
                    data={selectedVariant?.price}
                    as="span"
                    data-test="price"
                  />
                  {isOnSale && (
                    <Money
                      withoutTrailingZeros
                      data={selectedVariant?.compareAtPrice}
                      as="span"
                      className="opacity-50 strike"
                    />
                  )}
                </div>

                <div className="counter-number">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    type="button"
                    disabled={quantity === 1}
                  >
                    -
                  </button>
                  <Text as="span">{quantity}</Text>
                  <button onClick={() => handleQuantityChange(1)} type="button">
                    +
                  </button>
                </div>

                <AddToCartButton
                  lines={[
                    {
                      merchandiseId: selectedVariant.id,
                      quantity: quantity,
                    },
                  ]}
                  className="add-to-cart-1"
                  data-test="add-to-cart"
                >
                  <Text
                    as="span"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Add to Cart</span>
                  </Text>
                </AddToCartButton>
              </>
            )}
            {/* {!isOutOfStock && (
              <ShopPayButton
                width="100%"
                variantIds={[selectedVariant?.id]}
                storeDomain={storeDomain}
              />
            )} */}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   title: string;
 *   content: string;
 *   learnMore?: string;
 * }}
 */
function ProductDetail({title, content, learnMore}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2 py-8">
      {/* @ts-expect-error @headlessui/react incompatibility with node16 resolution */}
      {({open}) => (
        <>
          <h4 className="newboc">{title}</h4>
          {/* <Disclosure.Button className="text-left">
        <div className="flex justify-between">
          <IconClose
            className={`${
              open ? '' : 'rotate-[45deg]'
            } transition-transform transform-gpu duration-200`}
          />
        </div>
      </Disclosure.Button> */}

          <div
            // className="prose dark:prose-invert"
            className=""
            dangerouslySetInnerHTML={{__html: content}}
          />
          {/* <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
        {learnMore && (
          <div className="">
            <Link
              className="pb-px border-b border-primary/30 text-primary/50"
              to={learnMore}
            >
              Learn more
            </Link>
          </div>
        )}
      </Disclosure.Panel> */}
        </>
      )}
    </Disclosure>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        id
        title
        description
        handle
        seo {
          description
          title
        }
        image {
          id
          url
          width
          height
          altText
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      options {
        name
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...ProductVariantFragment
      }
      media(first: 7) {
        nodes {
          ...Media
        }
      }
      variants(first: 1) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
      metafield(namespace: "custom", key: "artistname") {
        value
      }
      metafieldPreviewAudio: metafield(namespace: "custom", key: "previewaudio") {
        value
        type
        reference {
          ... on MediaImage {
            id
            image {
              url
            }
          }
          ... on Video {
            id
            sources {
              url
              mimeType
            }
          }
          ... on GenericFile {
            id
            url
          }
        }
      }
    
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const VARIANTS_QUERY = `#graphql
  query variants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      variants(first: 250) {
        nodes {
          ...ProductVariantFragment
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;


const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/**
 * @param {Storefront} storefront
 * @param {string} productId
 */
async function getRecommendedProducts(storefront, productId) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return {nodes: mergedProducts};
}

/** @typedef {import('@shopify/remix-oxygen').MetaArgs} MetaArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').ProductQuery} ProductQuery */
/** @typedef {import('storefrontapi.generated').ProductVariantFragmentFragment} ProductVariantFragmentFragment */
/** @typedef {import('~/lib/type').Storefront} Storefront */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
