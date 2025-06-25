import React from 'react';
import { gsap } from 'gsap';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Routing from './routes/routes';
import { AuthProvider } from './contexts/AuthContext';
// gsap.config({
//     autoSleep: 60,
//     force3D: true,
//     nullTargetWarn: false,
// });
const App = () => {
    return (
        <div className="App">
            <AuthProvider>
                <Routing />
                <Toaster 
                    position="top-center"
                    toastOptions={{
                        success: {
                            duration: 3000,
                            style: {
                                fontFamily: 'Avenir',
                                background: '#4BB543',
                                color: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            style: {fontFamily: 'Avenir',
                                background: '#ff4444',
                                color: '#fff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </div>);
};
export default App;
