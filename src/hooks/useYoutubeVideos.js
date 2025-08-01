import { useState, useEffect } from 'react';

const API_BASE = 'https://runner-golf.wixstudio.com/runner/_functions';

export const useYouTubeVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract YouTube ID from any URL format
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Fetch all videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/getVideos`);
      const { videos } = await response.json();
      
      // Enhance with YouTube data
      const enhancedVideos = videos.map(video => ({
        ...video,
        videoId: getYouTubeId(video.url),
        thumbnail: `https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${getYouTubeId(video.url)}`
      }));
      
      setVideos(enhancedVideos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new video
  const addVideo = async (videoData) => {
    try {
      const response = await fetch(`${API_BASE}/addVideo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });
      await fetchVideos(); // Refresh list
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Update video
  const updateVideo = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE}/updateVideo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      await fetchVideos(); // Refresh list
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Delete video
  const deleteVideo = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/deleteVideo`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchVideos(); // Refresh list
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    addVideo,
    updateVideo,
    deleteVideo,
    refetch: fetchVideos
  };
};