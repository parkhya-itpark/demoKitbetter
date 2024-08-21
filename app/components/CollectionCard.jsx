// components/CollectionCard.jsx
import { Link } from '~/components/Link';
import { Heading } from '~/components/Text';

export function CollectionCard({ collection, loading }) {
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
