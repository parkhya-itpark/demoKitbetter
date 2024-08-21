import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './css/custom-swiper.css';
import './css/custom.css';
import {Section} from '~/components/Text';
import {ProductCard} from '~/components/ProductCard';

const mockProducts = {
  nodes: new Array(12).fill(''),
};

/**
 * @param {ProductSwimlaneProps}
 */
export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  prevClassName,
  nextClassName,
  ...props
}) {
  return (
    <Section heading={title} padding="y" {...props}>
      <div className="swiper-custom-data">
        <div className={prevClassName}>
          <svg
            width="10"
            height="17"
            viewBox="0 0 10 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 1.24L2 8.62L9 16" stroke="black" strokeWidth="1.5" />
          </svg>
        </div>
        <div className={nextClassName}>
          <svg
            width="10"
            height="16"
            viewBox="0 0 10 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.632812 0.690244L8.01169 8.06912L0.632812 15.448"
              stroke="black"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
      <Swiper
        className="swimlane hiddenScroll md:pb-8 md:scroll-px-8 lg:scroll-px-12 md:px-8 lg:px-12"
        modules={[Navigation]}
        spaceBetween={15} // Add this line
        slidesPerView={3}
        navigation={{
          nextEl: `.${nextClassName}`,
          prevEl: `.${prevClassName}`,
        }}
        pagination={{clickable: true}}
        breakpoints={{
          320: {
            slidesPerView: 2,
          },
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {products.nodes.map((product, index) => (
          <SwiperSlide key={product.id || index}>
            <ProductCard product={product} className="snap-start " />
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
}

/**
 * @typedef {HomepageFeaturedProductsQuery & {
 *   title?: string;
 *   count?: number;
 *   prevClassName: string;
 *   nextClassName: string;
 * }} ProductSwimlaneProps
 */

/** @typedef {import('storefrontapi.generated').HomepageFeaturedProductsQuery} HomepageFeaturedProductsQuery */
