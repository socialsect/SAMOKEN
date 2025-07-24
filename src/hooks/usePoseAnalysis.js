import { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { drawBallPath } from '../utils/canvasUtils';

export default function usePoseAnalysis(videoRef, canvasRef, setPoints) {
  const frameRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    tf.ready().then(async () => {
      try {
        const model = await tf.loadGraphModel(
          'https://tfhub.dev/google/movenet/singlepose/lightning/4',
          { fromTFHub: true }
        );
        modelRef.current = model;
      } catch (error) {
        console.error('Error loading model:', error);
      }
    });
    
    return () => stopAnalysis();
  }, []);

  const analyzePose = () => {
    function loop() {
      if (!videoRef.current || !canvasRef.current || !modelRef.current) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const inputTensor = tf.browser
        .fromPixels(video)
        .resizeNearestNeighbor([192, 192])
        .toFloat()
        .expandDims(0);

      modelRef.current.executeAsync(inputTensor)
        .then((res) => {
          tf.dispose(inputTensor);
          const keypoints = res[0].arraySync()[0][0];
          tf.dispose(res);

          // Your own logic to extract ball location from keypoints or external model
          const ball = keypoints.find((pt) => pt[2] > 0.4); // Placeholder: high confidence point
          if (ball) {
            setPoints((prev) => [...prev, { x: ball[0], y: ball[1] }]);
            drawBallPath(ctx, { x: ball[0], y: ball[1] });
          }
        })
        .catch(err => {
          console.error('Error during pose estimation:', err);
          tf.dispose(inputTensor);
        });

      frameRef.current = requestAnimationFrame(loop);
    }
    loop();
  };

  const stopAnalysis = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  return { analyzePose, stopAnalysis };
}
