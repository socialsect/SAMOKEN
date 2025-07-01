import React, { useEffect, useRef, useState } from "react";

const PutterTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState("--");

  // Utility to wait for OpenCV to finish loading
  const waitForOpenCV = (callback, interval = 100) => {
    if (window.cv && window.cv.Mat) callback();
    else setTimeout(() => waitForOpenCV(callback, interval), interval);
  };

  useEffect(() => {
    // Initialize webcam
    const initCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    };

    initCamera();

    waitForOpenCV(() => {
      console.log("✅ OpenCV Loaded");

      const interval = setInterval(() => {
        if (videoRef.current.readyState === 4) {
          detectLine();
        }
      }, 100); // every 100ms

      return () => clearInterval(interval);
    });
  }, []);

  const detectLine = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Load current frame into OpenCV matrix
    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const lines = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, edges, 50, 150, 3);
    cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 50, 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < lines.rows; i++) {
      const [x1, y1, x2, y2] = lines.data32S.slice(i * 4, i * 4 + 4);
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

      // Filter only near-vertical lines (adjust if needed)
      if (angleDeg > 60 && angleDeg < 120) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.stroke();

        setAngle(angleDeg.toFixed(2));
        break;
      }
    }

    // Free memory
    src.delete(); gray.delete(); edges.delete(); lines.delete();
  };

  return (
    <div>
      <h2>Putter Line Angle: {angle}°</h2>
      <video ref={videoRef} width="640" height="480" style={{ display: "none" }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
}

export default PutterTracker;
