import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import './Hero.css';
// Import Swiper CSS
import 'swiper/css/bundle';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    { src: '/1.png', alt: 'Futuristic journey through AI governance' },
    { src: '/2.png', alt: 'Industrial safety and compliance standards' },
    { src: '/3.png', alt: 'Why Remaining Ambiguity in AI Systems is Unacceptable' },
    { src: '/4.png', alt: 'Business professionals collaborating' },
    { src: '/5.png', alt: 'High-tech AI governance implementation' },
  ];

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="net-background"></div>
        <div className="threads-container"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-main">Where 98% Accuracy</span>
              <span className="highlight">Is Still Failure</span>
            </h1>
          </div>

            {/* <div className="hero-carousel">
              <div className="carousel-card-container">
                <div className="carousel-card">
                  */}

                {/* <div className="carousel-swiper-container"> */}
                  <Swiper
                    spaceBetween={50}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    effect={"coverflow"}
                    grabCursor={true}
                    centeredSlides={true}
                    loop={true}
                    slidesPerView={"auto"}
                    coverflowEffect={{
                      rotate: 0,
                      stretch: 0,
                      depth: 100,
                      modifier: 2.5,
                      slideShadows: false,
                    }}
                    pagination={false}
                    navigation={false}
                    modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
                    className="hero-swiper"
                    style={{marginBottom:"3rem"}}
                  >
                    {carouselImages.map((image, index) => (
                      <SwiperSlide key={index} className="hero-swiper-slide">
                        <div className="carousel-image-container">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="carousel-image"
                          />
                          <div className="image-overlay">
                            <div className="overlay-tag">TECHNOLOGY</div>
                            <div className="overlay-date">ARTICLE: JULY 25 2025</div>
                            <div className="overlay-title">Why Remaining Ambiguity in AI Systems is Unacceptable</div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                {/* </div> */}
              {/* </div> */}
            </div>
            
            {/* Orange accent line */}
            <div className="carousel-accent-line"></div>
          </div>
        {/* </div>
      </div> */}
    </section>
  );
};

export default Hero;