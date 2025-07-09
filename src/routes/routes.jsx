import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../Pages/Home";
import CameraPage from "../Pages/CameraPage";
import AuthPage from "../Pages/AuthPage";
import LoginPage from "../Pages/LoginPage";
import Signup from "../Pages/Signup";
import Training from "../Pages/Training";
import AIFit from "../Pages/AIFit";
import Settings from "../Pages/Settings";
import NotFound from "../Pages/NotFound";
import ScrollToTop from "../Components/scroll";
import "../index.css";
import { motion } from "framer-motion";
import Camera from "../Components/camera";
import { useEffect, useState } from "react";
import AuthCallback from "../Pages/AuthCallback";
import { Toaster } from "react-hot-toast";
import PostureDetector from "../Components/PostureDetection";
import PostureAnalyzer from "../Components/PostureAnalyzer";

const Routing = () => {
  return (
    <motion.div>
      <ScrollToTop>
        <Routes>
          <Route path="/posture-detection" element={<PostureAnalyzer/>}/>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/training" element={<Training />} />
          <Route path="/ai-fit" element={<AIFit />} />
          <Route path="/set" element={<Settings />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          {/* Catch-all route for 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        {/* <Camera /> */}
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
          }}
        />
      </ScrollToTop>
    </motion.div>
  );
};

export default Routing;
