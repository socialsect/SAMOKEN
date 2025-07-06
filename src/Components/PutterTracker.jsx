import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  FiCamera,
  FiCameraOff,
  FiChevronDown,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";
import { useClickAway } from "react-use";
import useCameraFeed from "../hooks/useCameraFeed";
import "../Styles/puttertracker.css";

const PuttingAnalyzer = () => {
  const canvasRef = useRef(null);
  const dropdownRef = useRef(null);
  const rafIdRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState(initialMetrics());
  const [strokes, setStrokes] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showCameraList, setShowCameraList] = useState(false);

  // Use the proven camera feed hook
  const { videoRef, devices, currentDeviceId, switchToDevice, isLoading } =
    useCameraFeed(isFullScreen);

  // Load OpenCV.js dynamically
  const loadOpenCV = async () => {
    return new Promise((resolve, reject) => {
      if (window.cv) return resolve();
      const script = document.createElement("script");
      script.src = "/libs/opencv.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load OpenCV.js"));
      document.head.appendChild(script);
    });
  };

  // Setup canvas when video is ready
  useEffect(() => {
    if (videoRef.current && isFullScreen) {
      const setupCanvas = () => {
        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          // console.log(
          //   "Canvas setup:",
          //   canvasRef.current.width,
          //   "x",
          //   canvasRef.current.height
          // );

          if (isProcessing) {
            rafIdRef.current = requestAnimationFrame(processFrame);
          }
        }
      };

      if (videoRef.current.readyState >= 2) {
        setupCanvas();
      } else {
        videoRef.current.onloadedmetadata = setupCanvas;
      }
    }
  }, [videoRef.current, isFullScreen, isProcessing]);

  const startAnalysis = async () => {
    try {
      // console.log("Starting analysis...");
      // console.log("User agent:", navigator.userAgent);
      // console.log(
      //   "Is mobile:",
      //   /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      //     navigator.userAgent
      //   )
      // );

      // Set full-screen to enable camera feed
      setIsFullScreen(true);
      setStrokes([]);
      setIsProcessing(true);

      // Request fullscreen and hide browser UI
      if (
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        try {
          // For mobile, try to hide browser UI
          const style = document.createElement("style");
          style.id = "fullscreen-style";
          style.textContent = `
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            html, body {
              overflow: hidden !important;
              position: fixed !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .video-fullscreen-container {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              z-index: 999999 !important;
              background: black !important;
              min-width: 100vw !important;
              min-height: 100vh !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
              overflow: hidden !important;
            }
            
            /* Handle orientation changes */
            @media screen and (orientation: landscape) {
              .video-fullscreen-container,
              .fullscreen-video,
              .fullscreen-canvas {
                width: 100vw !important;
                height: 100vh !important;
                min-width: 100vw !important;
                min-height: 100vh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
              }
            }
            
            @media screen and (orientation: portrait) {
              .video-fullscreen-container,
              .fullscreen-video,
              .fullscreen-canvas {
                width: 100vw !important;
                height: 100vh !important;
                min-width: 100vw !important;
                min-height: 100vh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
              }
            }
            .fullscreen-video {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              object-fit: cover !important;
              transform: scaleX(-1) !important;
              min-width: 100vw !important;
              min-height: 100vh !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
            }
            .fullscreen-canvas {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              z-index: 1000000 !important;
              min-width: 100vw !important;
              min-height: 100vh !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
            }
            .putting-analyzer.full-screen {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              z-index: 999998 !important;
            }
          `;
          document.head.appendChild(style);

          // Try to request fullscreen
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          }

          // For iOS, try to hide the address bar
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.scrollTo(0, 1);
            setTimeout(() => window.scrollTo(0, 0), 100);
          }
        } catch (error) {
          // console.log("Fullscreen request failed:", error);
        }
      }

      // console.log("Analysis started successfully");
    } catch (error) {
      // console.error("Failed to start analysis:", error);
    }
  };

  const stopAnalysis = () => {
    cancelAnimationFrame(rafIdRef.current);
    setIsProcessing(false);
    setIsFullScreen(false);

    // Remove fullscreen styles
    const fullscreenStyle = document.getElementById("fullscreen-style");
    if (fullscreenStyle) {
      fullscreenStyle.remove();
    }

    // Exit fullscreen
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  const processFrame = () => {
    if (!videoRef.current) {
      // console.log("processFrame: videoRef is null");
      return;
    }

    if (videoRef.current.readyState < 2) {
      // console.log(
      //   "processFrame: video not ready, readyState:",
      //   videoRef.current.readyState
      // );
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size to match screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (canvas.width !== screenWidth || canvas.height !== screenHeight) {
      canvas.width = screenWidth;
      canvas.height = screenHeight;
      // console.log(
      //   "Canvas resized to screen:",
      //   canvas.width,
      //   "x",
      //   canvas.height
      // );
    }

    // Draw video to canvas, covering entire screen
    if (canvas && ctx) {
      // Fill entire canvas with video, maintaining aspect ratio but covering all pixels
      const videoAspect = video.videoWidth / video.videoHeight;
      const screenAspect = screenWidth / screenHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (videoAspect > screenAspect) {
        // Video is wider than screen - scale to cover height
        drawHeight = screenHeight;
        drawWidth = screenHeight * videoAspect;
        offsetX = (screenWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Video is taller than screen - scale to cover width
        drawWidth = screenWidth;
        drawHeight = screenWidth / videoAspect;
        offsetX = 0;
        offsetY = (screenHeight - drawHeight) / 2;
      }

      ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

      // Debug: Draw a test rectangle to see if canvas is working
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(0, 0, 100, 50);

      // Draw stroke path
      if (strokes.length > 0) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.beginPath();
        strokes.forEach(({ x, y }, i) =>
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        );
        ctx.stroke();

        // Draw stroke points
        strokes.forEach((stroke, i) => {
          ctx.fillStyle = i === strokes.length - 1 ? "yellow" : "red";
          ctx.beginPath();
          ctx.arc(stroke.x, stroke.y, 8, 0, 2 * Math.PI);
          ctx.fill();

          // Draw stroke number
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.fillText(`${i + 1}`, stroke.x + 15, stroke.y - 15);
        });
      }

      // Draw metrics overlay with better visibility
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(10, 10, 320, 180);

      ctx.fillStyle = "#00FF00";
      ctx.font = "bold 20px Arial";
      ctx.fillText("PUTTING ANALYSIS", 20, 40);

      if (strokes.length > 0) {
        const currentStroke = strokes[strokes.length - 1];
        const metrics = [
          `Face Angle: ${currentStroke.faceAngle?.toFixed(1) || "0.0"}°`,
          `Launch Direction: ${
            currentStroke.launchDirection?.toFixed(1) || "0.0"
          }°`,
          `Ball Speed: ${currentStroke.ballSpeed?.toFixed(1) || "0.0"} m/s`,
          `Club Speed: ${currentStroke.clubSpeed?.toFixed(1) || "0.0"} m/s`,
          `Distance: ${
            currentStroke.theoreticalDistance?.toFixed(1) || "0.0"
          } m`,
        ];

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px Arial";
        metrics.forEach((metric, i) => {
          ctx.fillText(metric, 20, 70 + i * 25);
        });
      } else {
        ctx.fillStyle = "#FFFF00";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Tap screen to capture strokes", 20, 70);
      }

      // Draw stroke counter
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(canvas.width - 130, 10, 120, 50);
      ctx.fillStyle = "#00FF00";
      ctx.font = "bold 20px Arial";
      ctx.fillText(`STROKES: ${strokes.length}/3`, canvas.width - 120, 40);
    }

    if (isProcessing) rafIdRef.current = requestAnimationFrame(processFrame);
  };

  const handleCameraSelect = async (deviceId) => {
    if (deviceId !== currentDeviceId) {
      const success = await switchToDevice(deviceId);
      if (success) setShowCameraList(false);
    } else {
      setShowCameraList(false);
    }
  };

  useClickAway(dropdownRef, () => {
    setShowCameraList(false);
  });

  useEffect(() => {
    const init = async () => {
      await loadOpenCV();
    };
    init();
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div className={`putting-analyzer${isFullScreen ? " full-screen" : ""}`}>
      {!isFullScreen && (
        <>
          <h2>Golf Putting Analyzer</h2>
          <p>Select a camera and perform putting strokes.</p>

          <div className="camera-controls">
            <button
              onClick={startAnalysis}
              disabled={isProcessing || isLoading}
              className="start-analysis-btn"
              aria-label="Start Putting Analysis"
            >
              {isLoading ? "Loading..." : "Start Analysis"}
            </button>

            {devices.length > 1 && (
              <div className="camera-switch-container" ref={dropdownRef}>
                <button
                  className="camera-switch-btn"
                  onClick={() => setShowCameraList(!showCameraList)}
                  title="Switch Camera"
                  aria-label="Switch Camera"
                >
                  <FiRefreshCw className="button-icon" />
                  Switch Camera
                  <FiChevronDown className="button-icon" />
                </button>

                {showCameraList && (
                  <div className="camera-dropdown">
                    {devices.map((device) => (
                      <button
                        key={device.deviceId}
                        className={`camera-dropdown-item ${
                          currentDeviceId === device.deviceId ? "active" : ""
                        }`}
                        onClick={() => handleCameraSelect(device.deviceId)}
                        disabled={isLoading}
                      >
                        {device.label ||
                          `Camera ${device.deviceId.slice(0, 5)}`}
                        {currentDeviceId === device.deviceId && (
                          <FiCheck className="check-icon" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {isFullScreen && (
        <div className="video-fullscreen-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="fullscreen-video"
          ></video>
          <canvas
            ref={canvasRef}
            className="fullscreen-canvas"
            style={{
              zIndex: 100001,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "auto",
            }}
            onClick={(e) => {
              if (strokes.length < 3) {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Scale coordinates to match screen size
                const screenX = (x / rect.width) * window.innerWidth;
                const screenY = (y / rect.height) * window.innerHeight;

                const newStroke = {
                  x: screenX,
                  y: screenY,
                  ...generateMetrics({ x: screenX, y: screenY }),
                };
                setStrokes((prev) => [...prev, newStroke]);
                // console.log("Stroke captured:", newStroke);
              }
            }}
          ></canvas>

          <button
            className="close-fullscreen-btn"
            onClick={stopAnalysis}
            aria-label="Exit Fullscreen"
          >
            ✕
          </button>
        </div>
      )}

      {!isFullScreen && strokes.length === 3 && (
        <div className="putting-results">
          <h3>Analysis Complete!</h3>
          {[
            "faceAngle",
            "launchDirection",
            "ballSpeed",
            "clubSpeed",
            "theoreticalDistance",
          ].map((key) => (
            <p key={key}>
              <strong>{metricLabels[key]}:</strong>{" "}
              {calculateAverageMetric(strokes, key).toFixed(2)}
              {key.includes("Angle") || key.includes("Direction")
                ? "°"
                : " m/s"}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// Metric logic & helpers
const initialMetrics = () => ({
  faceAngle: 0,
  launchDirection: 0,
  ballSpeed: 0,
  clubSpeed: 0,
  theoreticalDistance: 0,
});

const metricLabels = {
  faceAngle: "Average Face Angle",
  launchDirection: "Average Launch Direction",
  ballSpeed: "Average Ball Speed",
  clubSpeed: "Average Club Speed",
  theoreticalDistance: "Average Theoretical Distance",
};

const generateMetrics = (centroid) => ({
  faceAngle: Math.random() * 10 - 5,
  launchDirection: Math.random() * 20 - 10,
  ballSpeed: Math.random() * 2 + 1,
  clubSpeed: Math.random() * 2 + 1,
  theoreticalDistance: Math.random() * 5 + 2,
});

const calculateAverageMetric = (strokes, key) =>
  strokes.reduce((sum, s) => sum + s[key], 0) / strokes.length;

export default PuttingAnalyzer;
