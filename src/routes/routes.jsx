import { Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import CameraPage from "../Pages/CameraPage";
import AuthPage from "../Pages/AuthPage";
import  "../index.css"
const Routing=()=>{
    return(
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camera" element={<CameraPage />} />
        {/* <Route path="/login" element={<AuthPage />} /> */}
     </Routes>   
    )
}

export default Routing
