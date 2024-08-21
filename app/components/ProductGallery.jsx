import React from 'react';
import {Carousel} from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {Image} from '@shopify/hydrogen';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 * @param {{
 *   media: MediaFragment[];
 *   className?: string;
 * }}
 */
export function ProductGallery({media, className}) {
  if (!media.length) {
    return null;
  }

  return (
    <div className={className}>
      <Carousel
        showThumbs={true}
        thumbWidth={100}
        infiniteLoop={true}
        showArrows={true}
        showStatus={false}
        emulateTouch={true}
        swipeable={true}
        renderThumbs={(thumbs) =>
          thumbs.map((thumb, index) => (
            <div key={index} className="carousel-thumb-container">
              {thumb}
            </div>
          ))
        }
      >
        {media.map((med, i) => {
          const image =
            med.__typename === 'MediaImage'
              ? {...med.image, altText: med.alt || 'Product image'}
              : null;

          return (
            <div key={med.id || image?.id}>
              {image && (
                <Image
                  loading={i === 0 ? 'eager' : 'lazy'}
                  data={image}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').MediaFragment} MediaFragment */
