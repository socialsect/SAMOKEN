import React from "react";
import TopNavbar from "../Components/TopNavbar";
import BottomNavbar from "../Components/BottomNavbar";
import "../Styles/home.css";
import { Link } from "react-router-dom";
import { usePuttingMetrics } from "../contexts/PuttingMetricsContext";

const Home = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const totalSlides = 3;

  const moveSlide = (direction) => {
    setCurrentSlide((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return totalSlides - 1;
      if (newIndex >= totalSlides) return 0;
      return newIndex;
    });
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      moveSlide(1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Update slide position when currentSlide changes
  React.useEffect(() => {
    const track = document.querySelector(".carousel-track");
    if (track) {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      // Update active dot
      const dots = document.querySelectorAll(".carousel-dots .dot");
      dots.forEach((dot, index) => {
        if (index === currentSlide) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }
  }, [currentSlide]);

  const { puttingMetrics } = usePuttingMetrics();

  return (
    <div className="home-container">
      <TopNavbar />

      <div className="greeting-section">
        <div className="user-greeting">
          <h2>
            HI <span className="highlight">SIMON</span> !
          </h2>
          <p className="paragraph">
            Are you ready to take your putting to the next level
            <span className="highlight"> ?</span>
          </p>
        </div>
        {/* Add Register and Log In buttons here, matching mobile design */}
        <button className="home-btn">Register</button>
        <button className="home-btn">Log In</button>
        <TopNavbar />
        <div className="carousel-section">
          <div className="carousel-container">
            <div className="carousel-track">
              <div className="carousel-slide active">
                <img
                  src="/carousel.png"
                  alt="Putting Slide 1"
                  className="carousel-image"
                />
              </div>
              <div className="carousel-slide">
                <img
                  src="/carousel.png"
                  alt="Putting Slide 2"
                  className="carousel-image"
                />
              </div>
              <div className="carousel-slide">
                <img
                  src="/carousel.png"
                  alt="Putting Slide 3"
                  className="carousel-image"
                />
              </div>
            </div>

            <button
              className="carousel-arrow left-arrow"
              onClick={() => moveSlide(-1)}
              aria-label="Previous slide"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_207_483)">
                  <path
                    d="M22.6375 5.8691C23.0288 5.4778 23.0279 4.8431 22.6355 4.4529L21.6807 3.50349C21.2898 3.1147 20.6579 3.11575 20.2682 3.50583L8.49301 15.2929C8.10283 15.6835 8.10299 16.3164 8.49337 16.7068L20.2795 28.4929C20.67 28.8834 21.3032 28.8834 21.6937 28.4929L22.6395 27.5471C23.03 27.1566 23.03 26.5234 22.6395 26.1329L13.2137 16.7071C12.8232 16.3166 12.8232 15.6834 13.2137 15.2929L22.6375 5.8691Z"
                    fill="white"
                    fillOpacity="0.5"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_207_483">
                    <rect width="32" height="32" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>

            <button
              className="carousel-arrow right-arrow"
              onClick={() => moveSlide(1)}
              aria-label="Next slide"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.36248 26.1309C8.97118 26.5222 8.97207 27.1569 9.36447 27.5471L10.3193 28.4965C10.7102 28.8853 11.3421 28.8843 11.7318 28.4942L23.507 16.7071C23.8972 16.3165 23.897 15.6836 23.5066 15.2933L11.7205 3.50711C11.33 3.11659 10.6968 3.11658 10.3063 3.50711L9.36049 4.4529C8.96996 4.84342 8.96996 5.47659 9.36049 5.86711L18.7863 15.2929C19.1768 15.6834 19.1768 16.3166 18.7863 16.7071L9.36248 26.1309Z"
                  fill="white"
                  fillOpacity="0.5"
                />
              </svg>
            </button>

            <div className="carousel-dots">
              <span
                className="dot active"
                onClick={() => goToSlide(0)}
                aria-label="Go to slide 1"
              ></span>
              <span
                className="dot"
                onClick={() => goToSlide(1)}
                aria-label="Go to slide 2"
              ></span>
              <span
                className="dot"
                onClick={() => goToSlide(2)}
                aria-label="Go to slide 3"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div className="social-links">
        <div className="link">
          <Link to="https://www.runner.golf/">
            <img
              src="/images/website-icon.svg"
              alt="Website"
              className="website-icon"
            />
          </Link>{" "}
          <p>WEBSITE</p>
        </div>
        <div className="link">
          <Link to="https://www.instagram.com/runner_golf/">
            <img src="/Logos/instagram.png" alt="Instagram" />
          </Link>{" "}
          <p>INSTAGRAM</p>
        </div>
        <div className="link">
          <Link to="https://www.facebook.com/Runnergolf/">
            <img
              src="/images/facebook-icon.svg"
              alt="Facebook"
              className="social-icon"
            />
          </Link>
          <p>FACEBOOK</p>
        </div>
      </div>

      <div className="stats-section">
        <h3 className="stats-heading">
          <span className="highlight">MY</span> PUTTING
        </h3>
        <div className="stats">
          {puttingMetrics.arcType && (
            <div className="stat-box">
              <p className="label">
                <span className="highlight">MY</span> ARC TYPE
              </p>
              <img src="/images/arc.png" alt="Arc Type" className="arc-img" />
              <p className="value paragraph">square to slight arc</p>
            </div>
          )}
          {puttingMetrics.faceAngle && (
            <div className="stat-box">
              <p className="label">
                <span className="highlight">MY</span> AVG. FACE ANGLE
              </p>
              <p className="value">
                0,4° <span className="red">R</span>
              </p>
            </div>
          )}
          {puttingMetrics.ballDirection && (
            <div className="stat-box">
              <p className="label">
                <span className="highlight">MY</span> AVG. BALL DIRECTION
              </p>
              <p className="value">
                0,6° <span className="red">L</span>
              </p>
            </div>
          )}
          {puttingMetrics.strokeRatio && (
            <div className="stat-box">
              <p className="label">
                <span className="highlight">MY</span> STROKE RATIO
              </p>
              <p className="value">1:1</p>
            </div>
          )}
          {puttingMetrics.dynamicControl && (
            <div className="stat-box">
              <p className="label">
                <span className="highlight">MY</span> DYNAMIC CONTROL
              </p>
              <p className="value">
                78 <span className="red">%</span>
              </p>
            </div>
          )}
          {puttingMetrics.puttPerformance && (
            <div className="stat-box">
              <p className="label">
                <span className="highlight">MY</span> PUTT PERFORMANCE
              </p>
              <p className="value">
                84 <span className="red">%</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};
export default Home;
