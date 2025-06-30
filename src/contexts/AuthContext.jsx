import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user is already logged in (e.g., from localStorage)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function - Replace with actual auth service call
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual authentication service call
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (email && password) {
        const mockUser = {
          id: 'user123',
          email,
          name: email.split('@')[0],
          // Add any other user properties you need
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { success: true };
      } else {
        throw new Error('Email and password are required');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Add any cleanup needed for your auth service
      localStorage.removeItem('user');
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error('Logout failed:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Signup function - Replace with actual signup service call
  const signup = useCallback(async (email, password, profile = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual signup service call
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (email && password) {
        // After successful registration, log the user in
        return await login(email, password);
      } else {
        throw new Error('Email and password are required');
      }
    } catch (err) {
      console.error('Signup failed:', err);
      setError(err.message || 'Signup failed');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        signup,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
