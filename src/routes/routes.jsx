// src/Routing.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import CameraPage from "../Pages/CameraPage";
import Home from "../Pages/Home";
import Training from "../Pages/Training";
import AIFit from "../Pages/AIFit";
import Settings from "../Pages/Settings";
import LoginPage from "../Pages/LoginPage";
import Signup from "../Pages/Signup";
import NotFound from "../Pages/NotFound";
import AuthCallback from "../Pages/AuthCallback";
import { Toaster } from "react-hot-toast";
import PostureDetector from "../Components/PostureDetection";
import PostureAnalyzer from "../Components/PostureAnalyzer";
import Profile from "../Pages/profile";
import StrokeArcAnalyzer from "../Pages/Stroke";
import { StrokeProvider } from "../contexts/StrokeContext";
import PostureDataCollector from "../Pages/collector";
import SAMPLE from "../Pages/sample";
import ScreenPostureAnalyzer from "../Pages/newsample";
import BallTracker from "../Pages/balltracker";
import LoginCallback from "../Pages/loginCallback";
import AuthPage from "../Pages/AuthPage";
import { motion } from "framer-motion";
import ScrollToTop from "../Components/scroll";
import { YouTubeVideoManager } from "../Pages/YoutubeVideoManager";

const Routing = () => {
  return (
    <motion.div>
      <ScrollToTop>
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
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/callback" element={<LoginCallback />} />

          {/* Protected routes */}
          <Route
            path="/new-posture"
            element={
              <ScreenPostureAnalyzer />
            }
          />
          <Route
            path="/library"
            element={
              <YouTubeVideoManager />
            }
          />
          <Route
            path="/ball-tracker"
            element={
              <BallTracker />
            }
          />
          <Route
            path="/collector"
            element={
              <PostureDataCollector />
            }
          />
          <Route
            path="/posture-detection"
            element={
              <SAMPLE />
            }
          />
          <Route
            path="/camera"
            element={
              <CameraPage />
            }
          />
          <Route
            path="/home"
            element={
              <Home />
            }
          />
          <Route
            path="/training"
            element={
              <Training />
            }
          />
          <Route
            path="/ai-fit"
            element={
              <AIFit />
            }
          />
          <Route
            path="/set"
            element={
              <Settings />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile />
            }
          />
          <Route
            path="/stroke"
            element={
              <StrokeProvider>
                <StrokeArcAnalyzer />
              </StrokeProvider>
            }
          />

          {/* Catch-all routes */}
          <Route
            path="/404"
            element={
              <NotFound />
            }
          />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </ScrollToTop>
    </motion.div>
  );
};

export default Routing;