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
import ScrollToTop from "../components/ScrollToTop";
import "../index.css";
import { motion } from 'framer-motion';

const Routing = () => {
  return (
  <motion.div>
    <ScrollToTop>
      <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/camera" element={<CameraPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/training" element={<Training />} />
      <Route path="/ai-fit" element={<AIFit />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
      {/* Catch-all route for 404 */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />

      </Routes>
    </ScrollToTop>
    </motion.div>
  );
};

export default Routing;
