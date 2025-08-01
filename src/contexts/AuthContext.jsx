// import React, { createContext, useContext, useState, useEffect } from 'react';
// import wixClient, { getCurrentMember, logout as clientLogout } from '../wixClient';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [member, setMember] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const login = async (tokens) => {
//     wixClient.auth.setTokens(tokens);
//     try {
//       const currentMember = await getCurrentMember();
//       setMember(currentMember);
//     } catch (error) {
//       console.error('Failed to fetch member after login:', error);
//       clientLogout();
//     }
//   };

//   const logout = () => {
//     clientLogout();
//     setMember(null);
//   };

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const currentMember = await getCurrentMember();
//         setMember(currentMember);
//       } catch (error) {
//         console.error('Auth check failed:', error);
//         setMember(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ member, isLoading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);