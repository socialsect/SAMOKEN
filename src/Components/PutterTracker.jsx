import React, { useEffect, useRef, useState } from "react";
const PutterTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState("--");
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const [loading, setLoading] = useState(true);

  // Load OpenCV
  const waitForOpenCV = (cb) => {
    if (window.cv && window.cv.Mat) cb();
    else setTimeout(() => waitForOpenCV(cb), 100);
  };

  // Get camera list
  const getCameraDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);

      if (!currentDeviceId && videoDevices.length > 0) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  // Start selected camera
  const startCamera = async (deviceId) => {
    try {
      setLoading(true);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error("Failed to start camera:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCameraDevices();
    waitForOpenCV(() => {
      const interval = setInterval(() => {
        if (videoRef.current?.readyState === 4) detectPutterLine();
      }, 100);
      return () => clearInterval(interval);
    });
  }, []);

  useEffect(() => {
    if (currentDeviceId) startCamera(currentDeviceId);
  }, [currentDeviceId]);

  const detectPutterLine = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const lines = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, edges, 50, 150);
    cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 30, 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const ROI = {
      xMin: canvas.width / 3,
      xMax: (canvas.width * 2) / 3,
      yMin: canvas.height / 3,
      yMax: (canvas.height * 2) / 3,
    };

    for (let i = 0; i < lines.rows; i++) {
      const [x1, y1, x2, y2] = lines.data32S.slice(i * 4, i * 4 + 4);
      const length = Math.hypot(x2 - x1, y2 - y1);
      const angleDeg = Math.abs(Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI));
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const inROI = midX >= ROI.xMin && midX <= ROI.xMax &&
                    midY >= ROI.yMin && midY <= ROI.yMax;
      const angleOk = angleDeg > 75 && angleDeg < 105;
      const lengthOk = length >= 40 && length <= 60;

      if (inROI && angleOk && lengthOk) {
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

    src.delete(); gray.delete(); edges.delete(); lines.delete();
  };

  return (
    <div>
      <h2>Putter Angle: {angle}°</h2>

      <label>
        Select Camera:{" "}
        <select
          value={currentDeviceId}
          onChange={(e) => setCurrentDeviceId(e.target.value)}
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(-4)}`}
            </option>
          ))}
        </select>
      </label>

      {loading && <p>Loading camera...</p>}

      <video ref={videoRef} width="640" height="480" style={{ display: "none" }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
}
export default PutterTracker;