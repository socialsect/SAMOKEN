import { useState, useEffect } from 'react';
import { useYouTubeVideos } from '../hooks/useYoutubeVideos';
import { useNavigate } from 'react-router-dom';
import "../Styles/YTPanel.css";
import TopNavbar from '../Components/TopNavbar';
import BottomNavbar from '../Components/BottomNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiTrash2, FiEye, FiArrowLeft } from 'react-icons/fi';

export const YTPanel = () => {
  const {
    videos,
    loading,
    error,
    addVideo,
    deleteVideo,
    refetch
  } = useYouTubeVideos();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add validation before submission
    if (!formData.title || !formData.url) {
      alert('Title and URL are required fields');
      return;
    }
    
    try {
      await addVideo(formData);
      
      // Reset form after successful submission
      setFormData({ title: '', description: '', url: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('YTPanel: Error in handleSubmit', error);
      alert('Error saving video: ' + error.message);
    }
  };
  

  const handleDelete = async (videoId) => {
    try {
      await deleteVideo(videoId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('YTPanel: Error in handleDelete', error);
      alert('Error deleting video: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', url: '' });
    setEditingVideo(null);
    setShowAddForm(false);
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) 
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

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
          <div className="header-left">
            <button onClick={handleBackToAdmin} className="btn-back">
              <FiArrowLeft /> Back to Admin
            </button>
            <h1>YouTube Media Library</h1>
          </div>
          <div className="admin-actions">
            <button 
              onClick={() => setShowAddForm(true)} 
              className="btn-primary"
            >
              + Add New Video
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="admin-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-section">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="title">Sort by Title</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              className="video-form-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="video-form"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="form-header">
                  <h3>{editingVideo ? 'Edit Video' : 'Add New Video'}</h3>
                  <button onClick={resetForm} className="close-btn">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="Video title"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Video description"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>YouTube URL *</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
             
                  <div className="form-actions">
                    <button type="button" onClick={resetForm} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingVideo ? 'Update Video' : 'Add Video'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video List */}
        <div className="admin-video-list">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading videos...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>Error loading videos: {error}</p>
              <button onClick={refetch} className="btn-primary">
                Retry
              </button>
            </div>
          ) : (
            <div className="video-table">
              <div className="table-header">
                <div className="header-cell">Thumbnail</div>
                <div className="header-cell">Title</div>
                <div className="header-cell">Description</div>
                <div className="header-cell">Actions</div>
              </div>
              {filteredVideos.map((video) => (
                <motion.div 
                  key={video.id} 
                  className="table-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="cell thumbnail-cell">
                    <img 
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                      alt={video.title}
                      className="video-thumb-large"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/240x180?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="cell title-cell">
                    <h4>{video.title}</h4>
                  </div>
                  <div className="cell description-cell">
                    <p className="video-description">{video.description || 'No description available'}</p>
                  </div>
                  <div className="cell actions-cell">
                    <div className="action-buttons">
                    
                      <button 
                        onClick={() => {
                          setShowDeleteConfirm(video.id);
                        }} 
                        className="btn-delete"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                      <button 
                        onClick={() => window.open(video.url, '_blank')} 
                        className="btn-view"
                        title="View"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile-friendly info section */}
                  <div className="mobile-info">
                    <p className="video-description">{video.description || 'No description available'}</p>
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          setShowDeleteConfirm(video.id);
                        }} 
                        className="btn-delete"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                      <button 
                        onClick={() => window.open(video.url, '_blank')} 
                        className="btn-view"
                        title="View"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredVideos.length === 0 && (
                <div className="no-videos">
                  <p>No videos found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="delete-confirm-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this video? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button 
                    onClick={() => setShowDeleteConfirm(null)} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDelete(showDeleteConfirm)} 
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
      <BottomNavbar />
    </div>
  );
};
