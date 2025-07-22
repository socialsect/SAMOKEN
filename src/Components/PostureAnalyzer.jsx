import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import "../libs/drawing_utils.js";
import "../libs/camera_utils.js";

const Camera = window.Camera;
const drawConnectors = window.drawConnectors;
const drawLandmarks = window.drawLandmarks;

const PostureDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [posture, setPosture] = useState("Loading...");

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const videoElement = videoRef.current;
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });

    camera.start();

    function onResults(results) {
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Mirror the image (for selfie view)
      canvasCtx.translate(canvasElement.width, 0);
      canvasCtx.scale(-1, 1);

      // Draw the video frame
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
          color: "red",
          lineWidth: 2,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "white",
          lineWidth: 1,
        });

        const classification = classifyPosture(results.poseLandmarks, canvasElement.height);
        setPosture(classification);
      }

      canvasCtx.restore();
    }

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, []);

  function classifyPosture(landmarks, height) {
    const getY = (i) => landmarks[i]?.y * height || 0;

    const angle_0 = getY(0);
    const angle_11 = getY(11);
    const angle_13 = getY(13);
    const angle_25 = getY(25);
    const angle_32 = getY(32);
    const angle_35 = getY(35);
    const angle_40 = getY(40);

    if (angle_25 <= 0.714 * height) {
      if (angle_13 <= 0.797 * height) {
        if (angle_32 <= 0.908 * height) return "Normal";
        else return "Upright";
      } else {
        if (angle_0 <= 1.32 * height) {
          if (angle_35 <= 0.433 * height) {
            if (angle_11 <= 0.684 * height) return "Upright";
            else return "Crouched";
          } else {
            if (angle_40 <= 1.465 * height) return "Upright";
            else return "Crouched";
          }
        } else return "Crouched";
      }
    } else {
      return "Normal";
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        backgroundColor: "black",
        fontFamily: "GoodTimes",
      }}
    >
      {/* Video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 1,
        }}
      />

      {/* Overlay UI */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "2rem",
          color: "white",
          pointerEvents: "none",
          textShadow: "0 0 10px black",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", color: "red", marginBottom: "1rem" }}>
          GOLF POSTURE CLASSIFIER
        </h1>
        <p style={{ fontSize: "1.2rem", backgroundColor: "black", padding: "0.5rem 1rem", borderRadius: "8px" }}>
          CURRENT POSTURE: <span style={{ color: "lime" }}>{posture}</span>
        </p>
      </div>
    </div>
  );
};

export default PostureDetector;