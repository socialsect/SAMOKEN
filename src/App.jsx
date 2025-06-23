import React from 'react';
import { gsap } from 'gsap';
import './App.css';
import Routing from './routes/routes';
// gsap.config({
//     autoSleep: 60,
//     force3D: true,
//     nullTargetWarn: false,
// });

const App = () => {
    return (
        <div className="App">
            <Routing   />
        </div>
    );
};

export default App;
