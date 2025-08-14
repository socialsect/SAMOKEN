import { useState, useEffect } from 'react';

const API_BASE = 'https://runner-golf.wixstudio.com/runner/_functions';

export const useYouTubeVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract YouTube ID from any URL format - improved version
  const getYouTubeId = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return null;
    }
    
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.trim().match(regExp);
    
    // Only return if we have a valid 11-character YouTube ID
    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }
    
    return null;
  };

  // Fetch all videos - improved error handling
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // console.log('Fetching videos from:', `${API_BASE}/getVideos`);
      
      const response = await fetch(`${API_BASE}/getVideos`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // console.log('Fetch videos response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch videos error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      // console.log('Fetch videos response data:', data);
      
      // Check if data has the expected structure
      if (!data || !data.videos) {
        throw new Error('Invalid response format: missing videos array');
      }
      
      const { videos } = data;
      
      // Filter out videos with empty required fields and enhance with YouTube data
      const validVideos = videos.filter(video => {
        return video && video.title && video.url && video.title.trim() !== '' && video.url.trim() !== '';
      });
      
      // console.log('Valid videos after filtering:', validVideos.length);
      
      // Enhance with YouTube data - handle null videoIds gracefully
      const enhancedVideos = validVideos.map(video => {
        const videoId = getYouTubeId(video.url);
        
        return {
          ...video,
          videoId: videoId,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null,
          embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null
        };
      });
      
      // console.log('Enhanced videos:', enhancedVideos);
      setVideos(enhancedVideos);
      
    } catch (err) {
      console.error('Fetch videos error:', err);
      setError(err.message);
      setVideos([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Add new video
  const addVideo = async (videoData) => {
    try {
      // console.log('=== ADD VIDEO DEBUG START ===');
      // console.log('Input videoData:', videoData);
      // console.log('API URL:', `${API_BASE}/addVideo`);
      
      // Ensure we have the required fields
      if (!videoData.title || !videoData.url) {
        throw new Error(`Missing required fields: title="${videoData.title}", url="${videoData.url}"`);
      }
      
      // Clean the data
      const cleanVideoData = {
        title: String(videoData.title || '').trim(),
        description: String(videoData.description || '').trim(),
        url: String(videoData.url || '').trim(),
      };
      
      // console.log('Clean video data:', cleanVideoData);
      
      const response = await fetch(`${API_BASE}/addVideo`, {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cleanVideoData)
      });
      
      // console.log('Add video response status:', response.status);
      // console.log('Add video response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Add video error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      // console.log('Add video success:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Add failed');
      }
      
      // console.log('=== ADD VIDEO DEBUG END ===');
      
      await fetchVideos(); // Refresh list
      return result;
    } catch (err) {
      console.error('=== ADD VIDEO ERROR ===');
      console.error('Add video error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Update video
  // const updateVideo = async (id, updates) => {
  //   try {
  //     // console.log('=== UPDATE VIDEO DEBUG START ===');
  //     // console.log('Updating video:', { id, updates });
  //     // console.log('API URL:', `${API_BASE}/updateVideo`);
      
  //     // Validate ID
  //     if (!id) {
  //       throw new Error('Video ID is required for update');
  //     }
      
  //     // Clean the updates data
  //     const cleanUpdates = {
  //       title: updates.title ? String(updates.title).trim() : undefined,
  //       description: updates.description ? String(updates.description).trim() : undefined,
  //       url: updates.url ? String(updates.url).trim() : undefined,
  //     };
      
  //     // Remove undefined values
  //     Object.keys(cleanUpdates).forEach(key => {
  //       if (cleanUpdates[key] === undefined) {
  //         delete cleanUpdates[key];
  //       }
  //     });
      
  //     const requestData = { id, ...cleanUpdates };
  //     // console.log('Request data:', requestData);
      
  //     const response = await fetch(`${API_BASE}/updateVideo`, {
  //       method: 'PUT', // Changed to PUT to match backend expectation
  //       headers: { 
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json'
  //       },
  //       body: JSON.stringify(requestData)
  //     });
      
  //     // console.log('Update video response status:', response.status);
      
  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('Update video error response:', errorText);
  //       throw new Error(`HTTP ${response.status}: ${errorText}`);
  //     }
      
  //     const result = await response.json();
  //     // console.log('Update video success:', result);
      
  //     if (!result.success) {
  //       throw new Error(result.error || 'Update failed');
  //     }
      
  //     // console.log('=== UPDATE VIDEO DEBUG END ===');
      
  //     await fetchVideos(); // Refresh list
  //     return result;
  //   } catch (err) {
  //     console.error('=== UPDATE VIDEO ERROR ===');
  //     console.error('Update video error:', err);
  //     setError(err.message);
  //     throw err;
  //   }
  // };

  // Delete video
  const deleteVideo = async (id) => {
    try {
      // console.log('=== DELETE VIDEO DEBUG START ===');
      // console.log('Deleting video:', id);
      // console.log('Video ID type:', typeof id);
      
      // Validate ID
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid video ID provided');
      }
      
      // console.log('API URL:', `${API_BASE}/deleteVideo`); // Fixed endpoint name
      
      const response = await fetch(`${API_BASE}/deleteVideo`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: String(id) }) // Send ID in body as expected by backend
      });
      
      // console.log('Delete video response status:', response.status);
      // console.log('Delete video response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete video error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      // console.log('Delete video success:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Delete failed');
      }
      
      // console.log('=== DELETE VIDEO DEBUG END ===');
      
      await fetchVideos(); // Refresh list
      return result;
    } catch (err) {
      console.error('=== DELETE VIDEO ERROR ===');
      console.error('Delete video error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    addVideo,
    // updateVideo,
    deleteVideo,
    refetch: fetchVideos,
    clearError
  };
};