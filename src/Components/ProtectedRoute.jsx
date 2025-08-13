import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading, user, checkAuthStatus, forceCleanup } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('ProtectedRoute:', { 
    requireAuth, 
    isAuthenticated, 
    isLoading, 
    user: !!user,
    pathname: location.pathname 
  });

  // Force re-check authentication if we're on a protected route but not authenticated
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated && !user) {
      console.log('ProtectedRoute: Forcing auth check...');
      // Try to check auth status, but if it fails, force cleanup
      checkAuthStatus().catch((error) => {
        console.log('ProtectedRoute: Auth check failed, forcing cleanup:', error);
        forceCleanup();
      });
    }
  }, [isLoading, requireAuth, isAuthenticated, user, checkAuthStatus, forceCleanup]);

  // Show toast notification when authentication is required but user is not authenticated
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated && !user) {
      // Add a small delay to give auth check time to complete
      const timer = setTimeout(() => {
        console.log('ProtectedRoute: Showing login required toast');
        toast.error('🔒 Please login to access this page!', {
          duration: 4000,
          style: {
            fontFamily: 'Avenir',
            background: '#ff4444',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ff4444',
          },
        });
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [isLoading, requireAuth, isAuthenticated, user]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="auth-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 60%), radial-gradient(circle at 50% 100%, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 60%), linear-gradient(180deg, #000000 0%, #323232 50%, #000000 100%)',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Noise texture overlay */}
        <div style={{
          content: "",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
          pointerEvents: "none",
          zIndex: 0
        }} />
        
        <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
          {/* Golf Ball Loader */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 2rem',
            position: 'relative',
            animation: 'bounce 1.5s ease-in-out infinite'
          }}>
            {/* Main golf ball */}
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f0f0f0 40%, #e0e0e0 100%)',
              boxShadow: 'inset -4px -4px 8px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              {/* Golf ball dimples */}
              <div style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.1)',
                boxShadow: '0 0 2px rgba(0,0,0,0.2)'
              }} />
              <div style={{
                position: 'absolute',
                top: '25%',
                right: '25%',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.1)',
                boxShadow: '0 0 2px rgba(0,0,0,0.2)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '20%',
                left: '30%',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.1)',
                boxShadow: '0 0 2px rgba(0,0,0,0.2)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '30%',
                right: '15%',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.1)',
                boxShadow: '0 0 2px rgba(0,0,0,0.2)'
              }} />
            </div>
            
            {/* Shadow */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '20px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
              animation: 'shadow 1.5s ease-in-out infinite'
            }} />
          </div>
          
          <p style={{ 
            fontFamily: 'var(--font-heading), "Good Times", sans-serif',
            fontSize: '1.5rem',
            color: '#cb0000',
            fontWeight: '400',
            marginBottom: '1rem'
          }}>Loading...</p>
          <p style={{ 
            fontFamily: 'var(--font-body), Avenir, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '300'
          }}>Checking authentication...</p>
        </div>
        
        {/* CSS Animations */}
        <style>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-30px);
            }
            60% {
              transform: translateY(-15px);
            }
          }
          
          @keyframes shadow {
            0%, 20%, 50%, 80%, 100% {
              transform: translateX(-50%) scaleX(1);
              opacity: 0.3;
            }
            40% {
              transform: translateX(-50%) scaleX(0.8);
              opacity: 0.1;
            }
            60% {
              transform: translateX(-50%) scaleX(0.9);
              opacity: 0.2;
            }
          }
        `}</style>
      </div>
    );
  }

  // If authentication is required and user is not authenticated, redirect
  if (requireAuth && !isAuthenticated && !user) {
    console.log('ProtectedRoute: Redirecting to login - not authenticated');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access auth page, redirect to home
  if (!requireAuth && isAuthenticated && user) {
    return <Navigate to="/home" replace />;
  }

  // Additional check: if we have user data but authentication state is false, update it
  if (requireAuth && user && !isAuthenticated) {
    console.log('ProtectedRoute: User data found but not authenticated, updating state');
    // This will trigger a re-render with correct state
    return <Navigate to={location.pathname} replace />;
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute;
