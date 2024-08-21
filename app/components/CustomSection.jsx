import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper';

// import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './css/custom-swiper.css';
import './css/custom.css';

import gallery1 from '../assets/gallery1.png';
import gallery2 from '../assets/gallery2.png';
import gallery3 from '../assets/gallery3.png';

export function CustomSection() {
  return (
    <div className="custom-section">
      <Swiper
        modules={[Navigation]}
        slidesPerView={3}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{clickable: true}}
        breakpoints={{
          // when window width is >= 320px
          320: {
            slidesPerView: 1,
          },
          // when window width is >= 640px
          640: {
            slidesPerView: 2,
          },
          // when window width is >= 1024px
          1024: {
            slidesPerView: 3,
          },
        }}
        onSwiper={(swiper) => console.log(swiper)}
        onSlideChange={() => console.log('slide change')}
      >
        <SwiperSlide>
          <div className="image-galley">
            <img src={gallery1} alt="" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="image-galley">
            <img src={gallery2} alt="" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="image-galley">
            <img src={gallery3} alt="" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="image-galley">
            <img src={gallery1} alt="" />
          </div>
        </SwiperSlide>
      </Swiper>
      <div className="swiper-button-prev"></div>
      <div className="swiper-button-next"></div>
    </div>
  );
}
