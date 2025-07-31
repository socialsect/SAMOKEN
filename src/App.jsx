import React from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Routing from "./routes/routes";
// import { AuthProvider } from "./contexts/AuthContext";
import { PuttingMetricsProvider } from "./contexts/PuttingMetricsContext";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import DesktopHome from "./Pages/DesktopHome";

function useIsDesktop() {
const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 1024);
React.useEffect(() => {
const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
window.addEventListener("resize", handleResize);
return () => window.removeEventListener("resize", handleResize);
}, []);
return isDesktop;
}

const App = () => {
const location = useLocation();
const isDesktop = useIsDesktop();
// Show DesktopHome only on /home and desktop
if (location.pathname === "/home" && isDesktop) {
return <DesktopHome />;
}
return (
<motion.div className="App">
<PuttingMetricsProvider>
{/* <AuthProvider> */}
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
{/* </AuthProvider> */}
</PuttingMetricsProvider>
</motion.div>
);
};
export default App;