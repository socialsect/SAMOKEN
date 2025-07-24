import { useEffect, useState } from 'react';

export default function useCamera(videoRef) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stream;
    let isMounted = true;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });

        if (!isMounted) {
          // Clean up if component unmounted while we were waiting
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          
          return new Promise((resolve) => {
            video.onloadedmetadata = () => {
              video.play()
                .then(() => {
                  if (isMounted) {
                    setLoading(false);
                    resolve();
                  }
                })
                .catch(err => {
                  if (isMounted) {
                    setError('Camera play() failed: ' + err.message);
                    setLoading(false);
                  }
                });
            };
            
            video.onerror = () => {
              if (isMounted) {
                setError('Video element error');
                setLoading(false);
              }
            };
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Camera initialization error:', err);
          setError('Camera Error: ' + (err.message || 'Failed to access camera'));
          setLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [videoRef]);

  return { error, loading };
}