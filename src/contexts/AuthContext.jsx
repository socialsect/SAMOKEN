// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import wixClient from '../wixClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        let tokens = null;
        try {
          tokens = JSON.parse(Cookies.get('session') || 'null');
          // console.log('Parsed session tokens:', tokens);
        } catch (error) {
          // console.error('Failed to parse session cookie:', error);
          toast.error('Invalid session data.');
        }

        if (tokens) {
          wixClient.auth.setTokens(tokens);
          // console.log('Tokens set in wixClient');
          const currentUser = await wixClient.members.getCurrentMember();
          // console.log('Current user fetched:', currentUser);
          if (!currentUser) {
            throw new Error('Failed to fetch current user');
          }
          setUser(currentUser);
        } else {
          // console.log('No session tokens found');
        }
      } catch (error) {
        // console.error('Auth check failed:', error);
        if (error.status === 401 || error.status === 403) {
          logout();
          toast.error('Session expired. Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (tokens) => {
    try {
      // console.log('Login called with tokens:', tokens);
      Cookies.set('session', JSON.stringify(tokens), { secure: true, sameSite: 'Strict', expires: 7 });
      // console.log('Session cookie set:', Cookies.get('session'));
      wixClient.auth.setTokens(tokens);
      const currentUser = await wixClient.members.getCurrentMember();
      // console.log('Current user after login:', currentUser);
      if (!currentUser) {
        throw new Error('Failed to fetch current user');
      }
      setUser(currentUser);
      toast.success('Login successful!');
      return currentUser;
    } catch (error) {
      // console.error('Login failed:', error);
      logout();
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('session');
    wixClient.auth.clearTokens();
    setUser(null);
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute = ({ children, redirectTo = '/' }) => {
  const { user, loading } = useAuth();
  // console.log('ProtectedRoute - User:', user, 'Loading:', loading);

  useEffect(() => {
    let toastId = null;
    if (!loading && !user) {
      toastId = toast.error('You must be logged in to access this page.');
    }
    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};