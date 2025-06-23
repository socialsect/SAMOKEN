import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (login === 'user' && password === '1234') {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="auth-header">
          <motion.img
            src="/Logos/THE RUNNER-LOGOS-01 (2).svg"
            alt="Runner Logo"
            className="auth-logo"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to your account</p>
        </div>

        {/* Form */}
        <div className="auth-form">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                  fontSize: '1.1rem'
                }} />
                <input
                  id="email"
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="form-control"
                  placeholder="Enter your email or username"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                  fontSize: '1.1rem'
                }} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Enter your password"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
              {error && <span className="error-message">{error}</span>}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  style={{
                    marginRight: '0.5rem',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }} 
                />
                Remember me
              </label>
              <a href="#" style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              className="btn"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : (
                <>
                  Sign In <FiArrowRight style={{ marginLeft: '8px' }} />
                </>
              )}
            </motion.button>

            <div className="social-divider">or continue with</div>

            <div className="social-buttons">
              <motion.button 
                type="button" 
                className="social-btn"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </motion.button>
              <motion.button 
                type="button" 
                className="social-btn"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.92.001c-1.5 0-1.792.715-1.792 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="#1877F2"/>
                </svg>
              </motion.button>
            </div>

            <p className="auth-footer">
              Don't have an account?{' '}
              <a href="#" className="auth-link">Sign up</a>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
//                   <input
//                     type="text"
//                     value={login}
//                     onChange={(e) => setLogin(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
//                     placeholder="Email or Username"
//                   />
//                 </div>

//                 {/* Password Input */}
//                 <div className="group relative mt-6">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FiLock className="size-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
//                   </div>
//                   <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
//                     placeholder="Password"
//                   />
//                 </div>

//                 {error && (
//                   <motion.p 
//                     className="text-pink-400 text-sm text-center"
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0 }}
//                   >
//                     {error}
//                   </motion.p>
//                 )}

//                 <div className="flex items-center justify-between text-sm">
//                   <label className="flex items-center">
//                     <input type="checkbox" className="form-checkbox h-4 w-4 text-purple-500 rounded bg-white/10 border-white/20 focus:ring-purple-500" />
//                     <span className="ml-2 text-gray-400">Remember me</span>
//                   </label>
//                   <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
//                     Forgot password?
//                   </a>
//                 </div>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
//                 >
//                   <span>Sign In</span>
//                   <FiArrowRight className="size-3.5" />
//                 </motion.button>

//                 <div className="relative my-6">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-white/10"></div>
//                   </div>
//                   <div className="relative flex justify-center text-sm">
//                     <span className="px-2 bg-transparent text-gray-400">OR CONTINUE WITH</span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3 mt-2">
//                   <button 
//                     type="button"
//                     className="flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
//                     style={{
//                       height: '40px',
//                       minWidth: '40px',
//                       padding: '0'
//                     }}
//                   >
//                     <svg className="text-gray-300" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
//                       <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.884-1.66-4.403-2.66-6.735-2.66-5.523 0-10 4.477-10 10s4.477 10 10 10c8.396 0 10-7.496 10-10 0-0.67-0.069-1.325-0.189-1.961h-9.811z"></path>
//                     </svg>
//                   </button>
//                   <button 
//                     type="button"
//                     className="flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
//                     style={{
//                       height: '40px',
//                       minWidth: '40px',
//                       padding: '0'
//                     }}
//                   >
//                     <svg className="text-gray-300" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
//                       <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
//                     </svg>
//                   </button>
//                 </div>

//                 <p className="mt-6 text-center text-sm text-gray-400">
//                   Don't have an account?{" "}
//                   <a href="#" className="text-purple-400 hover:text-white font-medium transition-colors">
//                     Sign up
//                   </a>
//                 </p>

//                 <p className="mt-8 text-xs text-center text-gray-500">
//                   By continuing, you agree to our{" "}
//                   <a href="#" className="text-purple-400 hover:underline">Terms of Service</a>{" "}
//                   and{" "}
//                   <a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>.
//                 </p>
//               </form>
//             </div>
//           </motion.div>
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// };

// export default LoginPage;