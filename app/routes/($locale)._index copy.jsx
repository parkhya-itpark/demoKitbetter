import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {Grid} from '~/components/Grid';
import {ProductCard} from '~/components/ProductCard';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {Section} from '~/components/Text';

const PAGE_BY = 8;

export async function loader({request, context: {storefront}}) {
  const searchParams = new URL(request.url).searchParams;
  const searchQuery = searchParams.get('search') || '';
  const variables = {
    first: PAGE_BY,
    query: searchQuery,
    country: storefront.i18n.country,
    language: storefront.i18n.language,
  };

  const data = await storefront.query(ALL_PRODUCTS_QUERY, {
    variables,
  });

  return json({
    products: data.products,
  });
}

export default function HomePage() {
  const {products} = useLoaderData();

  return (
    <Section>
      <Grid>
        {products.nodes.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            loading={getImageLoadingPriority(i)}
          />
        ))}
      </Grid>
    </Section>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $query: String
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      query: $query
    ) {
      nodes {
        ...ProductCard
        metafield(namespace: "custom", key: "artistname") {
          value
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').MetaArgs} MetaArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Collection} Collection */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
