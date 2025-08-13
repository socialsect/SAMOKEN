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
      console.log('Fetching videos from:', `${API_BASE}/getVideos`);
      
      const response = await fetch(`${API_BASE}/getVideos`);
      console.log('Fetch videos response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch videos error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetch videos response data:', data);
      
      const { videos } = data;
      
      // Enhance with YouTube data
      const enhancedVideos = videos.map(video => ({
        ...video,
        videoId: getYouTubeId(video.url),
        thumbnail: `https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${getYouTubeId(video.url)}`
      }));
      
      console.log('Enhanced videos:', enhancedVideos);
      setVideos(enhancedVideos);
    } catch (err) {
      console.error('Fetch videos error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new video - with enhanced debugging
  const addVideo = async (videoData) => {
    try {
      console.log('=== ADD VIDEO DEBUG START ===');
      console.log('Input videoData:', videoData);
      console.log('VideoData type:', typeof videoData);
      console.log('VideoData keys:', Object.keys(videoData));
      console.log('API URL:', `${API_BASE}/addVideo`);
      
      // Ensure we have the required fields before making the request
      if (!videoData.title || !videoData.url) {
        throw new Error(`Missing required fields: title="${videoData.title}", url="${videoData.url}"`);
      }
      
      // Clean the data to ensure no undefined values
      const cleanVideoData = {
        title: videoData.title ,
        description: videoData.description ,
        url: videoData.url ,
      };
      
      console.log('Clean video data:', cleanVideoData);
      
      const requestBody = JSON.stringify(cleanVideoData);
      console.log('Request body (string):', requestBody);
      console.log('Request body type:', typeof requestBody);
      console.log('Request body length:', requestBody.length);
      
      // Verify the JSON is parseable
      try {
        const parsed = JSON.parse(requestBody);
        console.log('Parsed verification:', parsed);
        console.log('Parsed title:', parsed.title);
        console.log('Parsed url:', parsed.url);
      } catch (parseTest) {
        console.error('JSON stringify/parse test failed:', parseTest);
        throw new Error('Failed to create valid JSON');
      }
      
      const fetchOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody
      };
      
      console.log('Fetch options:', fetchOptions);
      console.log('=== MAKING REQUEST ===');
      
      const response = await fetch(`${API_BASE}/addVideo`, fetchOptions);
      
      console.log('Add video response status:', response.status);
      console.log('Add video response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Add video error response:', errorText);
        console.error('Error response length:', errorText.length);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Add video success:', result);
      
      // Check if the backend returned an error even with 200 status
      if (result.success === false) {
        throw new Error(result.error || 'Add failed');
      }
      
      console.log('=== ADD VIDEO DEBUG END ===');
      
      await fetchVideos(); // Refresh list
      return result;
    } catch (err) {
      console.error('=== ADD VIDEO ERROR ===');
      console.error('Add video error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        videoData: videoData
      });
      throw err;
    }
  };

  // Update video - with enhanced debugging
  const updateVideo = async (id, updates) => {
    try {
      console.log('=== UPDATE VIDEO DEBUG START ===');
      console.log('Updating video:', { id, updates });
      console.log('API URL:', `${API_BASE}/updateVideo`);
      
      // Validate ID
      if (!id) {
        throw new Error('Video ID is required for update');
      }
      
      // Clean the updates data
      const cleanUpdates = {
        title: updates.title || '',
        description: updates.description || '',
        url: updates.url || '',
      };
      
      const requestData = { id, ...cleanUpdates };
      console.log('Request data:', requestData);
      
      const requestBody = JSON.stringify(requestData);
      console.log('Request body:', requestBody);
      console.log('Request body type:', typeof requestBody);
      console.log('Request body length:', requestBody.length);
      
      const response = await fetch(`${API_BASE}/updateVideo`, {
        method: 'POST', // Note: Using POST as per your backend setup
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody
      });
      
      console.log('Update video response status:', response.status);
      console.log('Update video response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update video error response:', errorText);
        console.error('Error response length:', errorText.length);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Update video success:', result);
      
      // Check if the backend returned an error even with 200 status
      if (result.success === false) {
        throw new Error(result.error || 'Update failed');
      }
      
      console.log('=== UPDATE VIDEO DEBUG END ===');
      
      await fetchVideos(); // Refresh list
      return result;
    } catch (err) {
      console.error('=== UPDATE VIDEO ERROR ===');
      console.error('Update video error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        id: id,
        updates: updates
      });
      throw err;
    }
  };

  // Delete video - with enhanced debugging
  const deleteVideo = async (id) => {
    try {
      console.log('=== DELETE VIDEO DEBUG START ===');
      console.log('Deleting video:', id);
      console.log('Video ID type:', typeof id);
      console.log('Video ID value:', id);
      
      // Validate ID before making request
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid video ID provided');
      }
      
      // Try query parameter approach first (as per your backend)
      console.log('Trying query parameter approach...');
      console.log('API URL:', `${API_BASE}/removeVideo?id=${encodeURIComponent(id)}`);
      
      let response = await fetch(`${API_BASE}/removeVideo?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      console.log('Delete video response status:', response.status);
      console.log('Delete video response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete video error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Delete video success:', result);
      
      // Check if the backend returned an error even with 200 status
      if (result.success === false) {
        throw new Error(result.error || 'Delete failed');
      }
      
      console.log('=== DELETE VIDEO DEBUG END ===');
      
      await fetchVideos(); // Refresh list
      return result;
    } catch (err) {
      console.error('=== DELETE VIDEO ERROR ===');
      console.error('Delete video error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        videoId: id
      });
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