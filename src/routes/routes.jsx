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
import LoginCallback from "../Pages/LoginCallback";
import { AuthProvider, ProtectedRoute } from "../contexts/AuthContext";
import AuthPage from "../Pages/AuthPage";
import { motion } from "framer-motion";
import ScrollToTop from "../Components/scroll";
import { YouTubeVideoManager } from "../Pages/YoutubeVideoManager";

const Routing = () => {
  return (
    <motion.div>
      <AuthProvider>
        <ScrollToTop>
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
                <ProtectedRoute>
                  <ScreenPostureAnalyzer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <YouTubeVideoManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ball-tracker"
              element={
                <ProtectedRoute>
                  <BallTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collector"
              element={
                <ProtectedRoute>
                  <PostureDataCollector />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posture-detection"
              element={
                <ProtectedRoute>
                  <SAMPLE />
                </ProtectedRoute>
              }
            />
            <Route
              path="/camera"
              element={
                <ProtectedRoute>
                  <CameraPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training"
              element={
                <ProtectedRoute>
                  <Training />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-fit"
              element={
                <ProtectedRoute>
                  <AIFit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/set"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stroke"
              element={
                <ProtectedRoute>
                  <StrokeProvider>
                    <StrokeArcAnalyzer />
                  </StrokeProvider>
                </ProtectedRoute>
              }
            />

            {/* Catch-all routes */}
            <Route
              path="/404"
              element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
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
      </AuthProvider>
    </motion.div>
  );
};

export default Routing;