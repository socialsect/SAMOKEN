import { Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import CameraPage from "../Pages/CameraPage";
import AuthPage from "../Pages/AuthPage";
import LoginPage from "../Pages/LoginPage";
import Signup from "../Pages/Signup";
import  "../index.css"
const Routing=()=>{
    return(
     <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/initial" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
     </Routes>   
    )
}

export default Routing
