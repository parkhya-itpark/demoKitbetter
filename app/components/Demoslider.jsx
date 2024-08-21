import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import gallery1 from '../assets/gallery1.png';
import gallery2 from '../assets/gallery2.png';
import gallery3 from '../assets/gallery3.png';

const Demoslider = () => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Number of items to show at once
    slidesToScroll: 1,
    
    centerMode:true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  return (
    <div>
      {' '}
      <Slider {...sliderSettings}>
        <div className="items">
          <img src={gallery1} alt="" />
        </div>
        <div className="items">
          <img src={gallery2} alt="" />
        </div>
        <div className="items">
          <img src={gallery3} alt="" />
        </div>
      </Slider>
    </div>
  );
};

export default Demoslider;
