import React, { createContext, useContext, useState, useEffect } from 'react';
import wixClient from '../wixClient';
import { useNavigate } from 'react-router-dom';

// Create the authentication context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated on component mount
  useEffect(() => {
    if (!hasCheckedAuth) {
      // Add a small delay if we're on the callback page to let AuthCallback process first
      const isOnCallbackPage = window.location.pathname === '/auth/callback';
      const delay = isOnCallbackPage ? 1000 : 0; // 1 second delay on callback page
      
      setTimeout(() => {
        checkAuthStatus();
        setHasCheckedAuth(true);
      }, delay);
    }
  }, [hasCheckedAuth]);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      // console.log('AuthContext: Checking authentication status...');
      
      // Check if we're on the auth callback page - if so, don't clear OAuth data
      const isOnCallbackPage = window.location.pathname === '/auth/callback';
      // console.log('AuthContext: On callback page:', isOnCallbackPage);
      
      // First check localStorage for saved tokens
      const savedTokens = localStorage.getItem('wixTokens');
      // console.log('AuthContext: Saved tokens found:', !!savedTokens);
      
      if (savedTokens) {
        try {
          const tokens = JSON.parse(savedTokens);
          // console.log('AuthContext: Parsed tokens:', tokens);
          
          // Validate tokens have required fields
          if (!tokens.accessToken) {
            throw new Error('Invalid tokens - missing accessToken');
          }
          
          // Set tokens in Wix client
          wixClient.auth.setTokens(tokens);
          // console.log('AuthContext: Tokens set in Wix client');
          
          // Try to get current member data
          const member = await wixClient.members.getCurrentMember();
          // console.log('AuthContext: Member data retrieved:', member);
          
          if (member) {
            setUser(member);
            setIsAuthenticated(true);
            // console.log('Session restored from localStorage successfully');
          } else {
            throw new Error('No member data received');
          }
        } catch (error) {
          // console.log('Saved tokens are invalid, clearing...', error);
          localStorage.removeItem('wixTokens');
          wixClient.auth.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
               } else {
           // Check if Wix client has tokens in memory
           const tokens = wixClient.auth.getTokens();
          //  console.log('AuthContext: Wix client tokens:', tokens);
           
           if (tokens && tokens.accessToken) {
             try {
               const member = await wixClient.members.getCurrentMember();
               if (member) {
                 setUser(member);
                 setIsAuthenticated(true);
                 
                 // Save tokens to localStorage for persistence
                 localStorage.setItem('wixTokens', JSON.stringify(tokens));
                //  console.log('Tokens saved to localStorage');
               } else {
                 throw new Error('No member data received');
               }
             } catch (error) {
              //  console.log('AuthContext: Invalid tokens in Wix client, clearing...', error);
               // Clear invalid tokens from Wix client and all storage
               wixClient.auth.logout();
               localStorage.removeItem('wixTokens');
               
               // Only clear OAuth data if we're not on the callback page
               if (!isOnCallbackPage) {
                 localStorage.removeItem('oauthRedirectData'); // Also clear OAuth data
                //  console.log('AuthContext: Cleared OAuth data (not on callback page)');
               } else {
                //  console.log('AuthContext: Preserved OAuth data (on callback page)');
               }
                
               setIsAuthenticated(false);
               setUser(null);
               
               // Force a clean state
              //  console.log('AuthContext: Forced cleanup of invalid session');
             }
           } else {
             // No tokens - this is normal for public routes
            //  console.log('AuthContext: No tokens found - user not authenticated');
             setIsAuthenticated(false);
             setUser(null);
           }
         }
    } catch (error) {
      // console.log('Auth check completed - no active session:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function - called after successful OAuth callback
  const login = async (tokens) => {
    try {
      // console.log('AuthContext: Starting login process with tokens:', tokens);
      setIsLoading(true);
      
      // Validate tokens
      if (!tokens || !tokens.accessToken) {
        throw new Error('Invalid tokens provided');
      }
      
      // Set tokens in Wix client
      wixClient.auth.setTokens(tokens);
      // console.log('AuthContext: Tokens set in Wix client');
      
      // Save tokens to localStorage for persistence
      localStorage.setItem('wixTokens', JSON.stringify(tokens));
      // console.log('Tokens saved during login');
      
      // Get current member data
      // console.log('AuthContext: Getting current member data...');
      const member = await wixClient.members.getCurrentMember();
      // console.log('AuthContext: Member data received:', member);
      
      if (!member) {
        throw new Error('Failed to retrieve member data');
      }
      
      // Update state synchronously
      setUser(member);
      setIsAuthenticated(true);
      // console.log('AuthContext: Authentication state updated - isAuthenticated:', true, 'user:', member);
      
      // Verify the state was set correctly
      setTimeout(() => {
        // console.log('AuthContext: State verification - isAuthenticated:', true, 'user:', !!member);
      }, 100);
      
      return { success: true, user: member };
    } catch (error) {
      console.error('Login failed:', error);
      await logout();
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear tokens from Wix client
      wixClient.auth.logout();
      
      // Clear tokens from localStorage
      localStorage.removeItem('wixTokens');
      localStorage.removeItem('oauthRedirectData');
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to home page (which shows AuthPage)
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force clear state even if logout fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('wixTokens');
      localStorage.removeItem('oauthRedirectData');
      navigate('/');
    }
  };

  // Force cleanup function for invalid sessions
  const forceCleanup = () => {
    // console.log('AuthContext: Force cleanup called');
    wixClient.auth.logout();
    localStorage.removeItem('wixTokens');
    localStorage.removeItem('oauthRedirectData');
    setUser(null);
    setIsAuthenticated(false);
    setHasCheckedAuth(false);
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const member = await wixClient.members.getCurrentMember();
      setUser(member);
      return member;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  // Check if user has specific permissions/roles
  const hasRole = (role) => {
    if (!user || !user.profile) return false;
    return user.profile.role === role;
  };

  // Get user's display name
  const getDisplayName = () => {
    if (!user) return '';
    
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    
    if (user.profile?.firstName) {
      return user.profile.firstName;
    }
    
    if (user.profile?.email) {
      return user.profile.email;
    }
    
    return 'User';
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    hasRole,
    getDisplayName,
    checkAuthStatus,
    forceCleanup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};