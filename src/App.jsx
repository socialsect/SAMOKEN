import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Lenis from "lenis";
import "./App.css";

// GSAP register plugin
gsap.config({
    autoSleep: 60,
    force3D: true,
    nullTargetWarn: false,
});

const App = () => {
    const comingSoonRef = useRef(null);
    const logoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Text hover animation
    const animateText = (element, isHovering) => {
        gsap.to(element, {
            color: isHovering ? "#BA1E1E" : "inherit",
            scale: isHovering ? 1.2 : 1,
            duration: 0.3,
            ease: "power2.out"
        });
    };

    useEffect(() => {
        // Initialize Lenis for smooth scroll
        const lenis = new Lenis({
            lerp: 0.1, // Adjust the smoothness of scroll
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // GSAP Animation for "Coming Soon"
        const textElements = comingSoonRef.current.querySelectorAll("p");
        
        // Animated text with randomness, rotation, scaling, and direction
        gsap.fromTo(
            textElements,
            {
                opacity: 0,
                x: () => gsap.utils.random(-400, 400), // Start from random X position
                y: () => gsap.utils.random(-400, 400), // Start from random Y position
                rotation: () => gsap.utils.random(-360, 360), // Random rotation angle
                scale: 0.5, // Start from smaller size
            },
            {
                opacity: 1,
                x: 0, // Final position in the center
                y: 0, // Final position in the center
                scale: 1, // Grow to original size
                rotation: 0, // Reset rotation
                duration: 2,
                ease: "power4.out",
                stagger: 0.2, // Stagger each element
                delay: 1, // Start animation after 1 second
            }
        );
    }, []);

    return (
        <div className="flex justify-center items-center h-[90vh] flex-col relative">
            <div className="relative">
                <img
                    src="/Logos/THE RUNNER-LOGOS-01 (2).svg"
                    alt="Runner Logo"
                    height={100}
                    className="z-10 drop-shadow-lg"
                />
            </div>
            <div 
                ref={comingSoonRef}
                className="text-4xl font-bold text-center mt-10 z-20 flex justify-center items-center"
                style={{ gap: '1rem' }}
            >
                <p 
                    className="cursor-pointer will-change-transform"
                    style={{ fontFamily: 'GoodTimes, sans-serif' }}
                    onMouseEnter={(e) => animateText(e.target, true)}
                    onMouseLeave={(e) => animateText(e.target, false)}
                >
                    Coming
                </p>
                <p 
                    className="cursor-pointer will-change-transform"
                    style={{ fontFamily: 'GoodTimes, sans-serif' }}
                    onMouseEnter={(e) => animateText(e.target, true)}
                    onMouseLeave={(e) => animateText(e.target, false)}
                >
                    Soon
                </p>
            </div>
        </div>
    );
};

export default App;
