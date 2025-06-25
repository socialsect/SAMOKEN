import React from "react";
import { Link } from "react-router-dom";
const Home = () => {

    return (
        <div className="flex justify-center items-center h-[90vh] flex-col relative">
            <div className="relative w-full px-4">
                <div className="max-w-xs mx-auto">
                    <img
                        src="Logos/THE RUNNER-LOGOS-01 (2).svg"
                        alt="Runner Logo"
                        className="w-full h-auto drop-shadow-lg"
                        style={{ maxHeight: '100px' }}
                        loading="lazy"
                    />
                </div>
            </div>
            <div 
                className="text-4xl font-bold text-center mt-10 z-20 flex justify-center items-center"
                style={{ gap: '1rem', fontFamily: 'GoodTimes, sans-serif' }}
            >
                <p>Coming</p>
                <p>Soon</p>
            </div>
            <Link to="/camera"><button>The Camera Page</button></Link>
            <Link to="/login"><button>Log In</button></Link>
            <Link to="/signup"><button>Sign Up</button></Link>
        </div>
    );
};

export default Home;