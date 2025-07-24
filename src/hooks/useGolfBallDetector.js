import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function useGolfBallDetector(videoRef, canvasRef, onDetect) {
  const modelRef = useRef();
  const requestRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    tf.loadGraphModel(
      'https://universe.roboflow.com/models/golf-ball-detection-hii2e/model.json'
    )
      .then(m => {
        modelRef.current = m;
        setLoading(false);
      })
      .catch(e => setError('Model load failed: ' + e.message));
  }, []);

  const detectLoop = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!modelRef.current || !video || video.readyState < 2) {
      requestRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const tfImg = tf.browser.fromPixels(video);
    const input = tf.image
      .resizeBilinear(tfImg, [416, 416])
      .div(255)
      .expandDims(0);

    let preds;
    try {
      preds = await modelRef.current.executeAsync(input);
    } catch (e) {
      console.error('Inference error:', e);
      tf.dispose([tfImg, input]);
      requestRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const [boxes, scores] = preds;
    const boxesArr = boxes.arraySync();
    const scoresArr = scores.arraySync();

    tf.dispose([tfImg, input, ...preds]);

    const ctx = canvas.getContext('2d');
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    canvas.width = vw;
    canvas.height = vh;
    ctx.clearRect(0, 0, vw, vh);

    boxesArr.forEach((b, i) => {
      if (scoresArr[i] > 0.5) {
        const [y1, x1, y2, x2] = b;
        const bx = x1 * vw,
          by = y1 * vh;
        const bw = (x2 - x1) * vw,
          bh = (y2 - y1) * vh;
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 4;
        ctx.strokeRect(bx, by, bw, bh);
        onDetect({ x: bx + bw / 2, y: by + bh / 2, score: scoresArr[i] });
      }
    });

    requestRef.current = requestAnimationFrame(detectLoop);
  };

  useEffect(() => {
    if (!loading && !error) detectLoop();
    return () => cancelAnimationFrame(requestRef.current);
  }, [loading, error]);

  return { loading, error };
}