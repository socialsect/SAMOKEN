import { useEffect } from 'react';
import { useYouTubeVideos } from '../hooks/useYoutubeVideos';
import "../Styles/yotubevideomanager.css";
import TopNavbar from '../Components/TopNavbar';
import BottomNavbar from '../Components/BottomNavbar';
import { motion } from 'framer-motion';

export const YouTubeVideoManager = () => {
  const {
    videos,
    loading,
    error
  } = useYouTubeVideos();

  if (loading) return (
    <div className="auth-container">
      <TopNavbar />
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading videos...</p>
      </div>
      <BottomNavbar />
    </div>
  );

  if (error) return (
    <div className="auth-container">
      <TopNavbar />
      <div className="error-message">
        <p>Error loading videos: {error}</p>
      </div>
      <BottomNavbar />
    </div>
  );

  return (
    <div className="auth-container">
      <TopNavbar />
      <motion.main 
        className="video-manager"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="page-title">Training Videos</h1>
        
        {/* Video Grid */}
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail" onClick={() => window.open(video.url, '_blank')}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                />
                <div className="play-button">
                  <svg viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.main>
      <BottomNavbar />
    </div>
  );
};