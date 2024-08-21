import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {useState} from 'react';
import invariant from 'tiny-invariant';
import {
  Pagination,
  getPaginationVariables,
  getSeoMeta,
} from '@shopify/hydrogen';
import {Grid} from '~/components/Grid';
import {Link} from '~/components/Link';
import {Heading, Section} from '~/components/Text';
import {ProductCard} from '~/components/ProductCard';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {SortFilter} from '~/components/SortFilter';
import Product from './($locale).products.$productHandle';
import {CustomSection} from '~/components/CustomSection';
import {Header} from '~/components/CartLayout';
import {SortFilterProduct} from '~/components/SortFilterProduct';

const PAGE_BY = 8;

export const headers = routeHeaders;

export async function loader({request, context: {storefront}}) {
  const searchParams = new URL(request.url).searchParams;
  const searchQuery = searchParams.get('search') || '';
  const {sortKey, reverse} = getSortValuesFromParam(searchParams.get('sort'));

  const variables = getPaginationVariables(request, {pageBy: PAGE_BY});

  // Fetch products
  const data = await storefront.query(ALL_PRODUCTS_QUERY, {
    variables: {
      ...variables,
      sortKey,
      reverse,
      query: searchQuery,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  // Fetch collections
  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'all-products',
      title: 'All Products',
      handle: 'products',
      descriptionHtml: 'All the store products',
      description: 'All the store products',
      seo: {
        title: 'All Products',
        description: 'All the store products',
      },
      metafields: [],
      products: data.products,
      updatedAt: '',
    },
  });

  return json({
    products: data.products,
    collections: collections.nodes,
    seo,
  });
}

export const meta = ({matches}) => {
  return getSeoMeta(...matches.map((match) => match.data.seo));
};

export default function HomePage() {
  const {products, collections} = useLoaderData();
  const [searchTerm, setSearchTerm] = useState('');

  const [isOpen, setIsOpen] = useState(false);

  const openNav = () => {
    setIsOpen(true);
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterProducts = (products) => {
    return products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  function CollectionCard({collection}) {
    return (
      <Link
        prefetch="viewport"
        to={`/collections/${collection.handle}`}
        className="grid gap-4"
      >
        <Heading as="h3" size="copy">
          {collection.title}
        </Heading>
      </Link>
    );
  }

  return (
    <>
      <Section>
        <CustomSection />
      </Section>

      

      <Section className='lg:pt-0'>
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
                  <h2>All album</h2>
                  <Link to="/collections" className="static-link">
                    <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                      All
                    </h3>
                  </Link>
                  <div items={collections.length === 3 ? 3 : 2}>
                    {collections.map((collection) => (
                      <CollectionCard
                        collection={collection}
                        key={collection.id}
                      />
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
      <Section className="lg:pt-0">
        <div className="row">
          <div className="col-sm-3">
            <div className="collection-length">
              <div className="mb-4">
                <h2>All album</h2>
                <Link to="/" className="static-link">
                  <h3 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                    All
                  </h3>
                </Link>
                <div items={collections.length === 3 ? 3 : 2}>
                  {collections.map((collection) => (
                    <CollectionCard
                      collection={collection}
                      key={collection.id}
                    />
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
            <>
              <div className="lg:flex md:flex justify-between items-center relative">
                <div style={{position: 'relative'}}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="search-bar"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{position: 'absolute', right: '15px', top: '12px'}}
                  >
                    <path
                      d="M13.7247 14.1959L18.3809 18.9636M8.50332 16.4105C12.5815 16.4105 15.8875 13.0253 15.8875 8.84945C15.8875 4.67359 12.5815 1.28839 8.50332 1.28839C4.42515 1.28839 1.11914 4.67359 1.11914 8.84945C1.11914 13.0253 4.42515 16.4105 8.50332 16.4105Z"
                      stroke="black"
                      strokeOpacity="0.9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <i
                    className="fal fa-search"
                    style={{position: 'relative', right: '30px'}}
                  ></i>
                </div>

                <SortFilterProduct
                  filters={[]}
                  appliedFilters={[]}
                  products={products}
                />
              </div>
              <Pagination connection={products}>
                {({nodes, isLoading, NextLink, PreviousLink}) => {
                  const filteredProducts = filterProducts(nodes);
                  const itemsMarkup = filteredProducts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={getImageLoadingPriority(i)}
                    />
                  ));

                  return (
                    <>
                      <div className="flex items-center justify-center mt-6">
                        <PreviousLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                          {isLoading ? 'Loading...' : 'Previous'}
                        </PreviousLink>
                      </div>

                      <Grid data-test="product-grid">{itemsMarkup}</Grid>
                      <div className="flex items-center justify-center mt-6">
                        <NextLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                          {isLoading ? 'Loading...' : 'Next'}
                        </NextLink>
                      </div>
                    </>
                  );
                }}
              </Pagination>
            </>
          </div>
        </div>
      </Section>
    </>
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

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: $sortKey,
      reverse: $reverse,
      query: $query
    ) {
      nodes {
        ...ProductCard
        metafield(namespace: "custom", key: "artistname") {
          value
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
  ${PRODUCT_CARD_FRAGMENT}
`;

function getSortValuesFromParam(sortParam) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}

/** @typedef {import('@shopify/remix-oxygen').MetaArgs} MetaArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Collection} Collection */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
