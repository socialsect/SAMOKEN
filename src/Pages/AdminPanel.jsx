import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Styles/AdminDashboard.css";
import TopNavbar from '../Components/TopNavbar';
import BottomNavbar from '../Components/BottomNavbar';
import { motion } from 'framer-motion';
import { 
  FiYoutube, 
  FiUsers, 
  FiSettings, 
  FiFileText, 
  FiLogOut,
  FiShield
} from 'react-icons/fi';



export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const navigate = useNavigate();

  // Simple authentication (in production, use proper JWT/auth system)
  const handleLogin = () => {
    if (adminPassword === 'admin123') { // Replace with secure authentication
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Invalid password');
    }
  };
  
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const handleNavigateToSection = (section) => {
    switch (section) {
      case 'yt-media':
        navigate('/yt-panel');
        break;
      case 'users':
        // navigate('/admin/users');
        alert('Users Management - Coming Soon!');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'content':
        // navigate('/admin/content');
        alert('Content Management - Coming Soon!');
        break;
      case 'settings':
        // navigate('/admin/settings');
        alert('Admin Settings - Coming Soon!');
        break;
      default:
        break;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <TopNavbar />
        <div className="admin-login">
          <motion.div 
            className="login-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="login-header">
              <FiShield className="login-icon" />
              <h2>Admin Access</h2>
              <p>Enter admin password to continue</p>
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button onClick={handleLogin} className="btn-primary">
              Login
            </button>
          </motion.div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <TopNavbar />
      <motion.main 
        className="admin-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-actions">
            <button onClick={handleLogout} className="btn-secondary">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        <div className="admin-dashboard">
          <div className="dashboard-grid">
            {/* YouTube Media Library */}
            <motion.div 
              className="dashboard-card youtube-card"
              onClick={() => handleNavigateToSection('yt-media')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-icon">
                <FiYoutube />
              </div>
              <h3>YouTube Media Library</h3>
              <p>Manage your YouTube video collection, add new videos, edit descriptions, and organize your content.</p>
              <div className="card-stats">
                <span>Videos</span>
                <span>Library</span>
              </div>
            </motion.div>

            {/* User Management & Analytics */}
            <motion.div 
              className="dashboard-card users-card"
              onClick={() => handleNavigateToSection('analytics')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-icon">
                <FiUsers />
              </div>
              <h3>User Management & Analytics</h3>
              <p>Manage user accounts, view analytics, and monitor user engagement metrics.</p>
              <div className="card-stats">
                <span>Users</span>
                <span>Analytics</span>
              </div>
            </motion.div>

            {/* Content Management */}
            <motion.div 
              className="dashboard-card content-card"
              onClick={() => handleNavigateToSection('content')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-icon">
                <FiFileText />
              </div>
              <h3>Content Management</h3>
              <p>Manage website content, pages, blog posts, and other digital assets.</p>
              <div className="card-stats">
                <span>Content</span>
                <span>Pages</span>
              </div>
            </motion.div>

            {/* Admin Settings */}
            <motion.div 
              className="dashboard-card settings-card"
              onClick={() => handleNavigateToSection('settings')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-icon">
                <FiSettings />
              </div>
              <h3>Admin Settings</h3>
              <p>Configure system settings, security options, and administrative preferences.</p>
              <div className="card-stats">
                <span>Config</span>
                <span>Security</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>
      

      
      <BottomNavbar />
    </div>
  );
};