import React from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Routing from "./routes/routes";
import { AuthProvider } from "./contexts/AuthContext";
import TopNavbar from "./Components/TopNavbar";
import BottomNavbar from "./Components/BottomNavbar";
import { motion } from "framer-motion";

const App = () => {
  return (
    <motion.div className="App">
      <AuthProvider>
        {/* <TopNavbar /> */}
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
          }}
        />
        {/* <BottomNavbar /> */}
      </AuthProvider>
    </motion.div>
  );
};
export default App;
