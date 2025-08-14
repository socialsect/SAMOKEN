import React from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Routing from "./routes/routes";
import { PuttingMetricsProvider } from "./contexts/PuttingMetricsContext";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';


const App = () => {
    const location = useLocation();

    return (
        <motion.div className="App">
            <PuttingMetricsProvider>
                <main className="main-content">
                    <Routing />
                </main>
                <Toaster
                    position="top-center"
                    toastOptions={{
                        success: {
                            duration: 3000,
                            style: {
                                fontFamily: "Avenir",
                                background: "#4BB543",
                                color: "#fff",
                            },
                        },
                        error: {
                            duration: 4000,
                            style: {
                                fontFamily: "Avenir",
                                background: "#ff4444",
                                color: "#fff",
                            },
                        },
                    }} />
                {/* <BottomNavbar /> */}
            </PuttingMetricsProvider>
            <Analytics />
        </motion.div>
    );
};
export default App;