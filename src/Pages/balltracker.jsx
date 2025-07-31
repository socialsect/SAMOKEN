import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const MAX_PUTTS = 3;
const API_URL = "https://0f666eaf33fe.ngrok-free.app/analyze-ball";

// Mobile-optimized Golf Ball Physics Kalman Filter
class MobileOptimizedKalmanFilter {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.initialized = false;
        this.lastUpdate = Date.now();
        this.confidence = 0;
        this.stationaryCount = 0;
        this.detectionStreak = 0;
        this.processNoise = 0.08; // Optimized for mobile processing
        this.measurementNoise = 0.6; // Higher tolerance for mobile cameras
    }

    filter(measurement) {
        const now = Date.now();
        const dt = Math.min((now - this.lastUpdate) / 1000, 0.15);
        this.lastUpdate = now;

        if (!measurement || measurement.length < 2) {
            this.detectionStreak = 0;
            
            if (this.initialized && this.confidence > 0.25) {
                this.confidence *= 0.88; // Slower decay for mobile
                
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                
                const friction = 0.97; // Less aggressive for mobile
                this.vx *= friction;
                this.vy *= friction;
                
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed < 1.5) {
                    this.vx *= 0.92;
                    this.vy *= 0.92;
                    this.stationaryCount++;
                } else {
                    this.stationaryCount = 0;
                }
                
                return [this.x, this.y];
            }
            return null;
        }

        const [mx, my] = measurement;
        this.detectionStreak++;
        
        if (!this.initialized) {
            this.x = mx;
            this.y = my;
            this.vx = 0;
            this.vy = 0;
            this.initialized = true;
            this.confidence = 0.9;
            this.stationaryCount = 0;
            return [this.x, this.y];
        }

        const dx = mx - this.x;
        const dy = my - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mobile-optimized adaptive gain
        let kalmanGain;
        if (this.detectionStreak > 2 && distance < 25) {
            kalmanGain = 0.35; // More conservative
        } else if (distance > 40) {
            kalmanGain = 0.75; // Quick adaptation for jumps
        } else {
            kalmanGain = 0.55; // Balanced
        }
        
        const newVx = dx / dt;
        const newVy = dy / dt;
        const velocityGain = 0.65;
        this.vx = velocityGain * newVx + (1 - velocityGain) * this.vx;
        this.vy = velocityGain * newVy + (1 - velocityGain) * this.vy;
        
        this.x = kalmanGain * mx + (1 - kalmanGain) * this.x;
        this.y = kalmanGain * my + (1 - kalmanGain) * this.y;
        
        this.confidence = Math.min(1.0, this.confidence + 0.12);
        this.stationaryCount = 0;
        
        return [this.x, this.y];
    }

    getConfidence() {
        return this.confidence;
    }

    isStationary() {
        return this.stationaryCount > 6;
    }

    getDetectionStreak() {
        return this.detectionStreak;
    }
}

// Lightweight path smoothing for mobile
const smoothPath = (path, windowSize = 2) => {
    if (path.length < windowSize) return path;

    const smoothed = [];
    for (let i = 0; i < path.length; i++) {
        if (path[i].x === undefined || path[i].y === undefined) {
            smoothed.push(path[i]);
            continue;
        }

        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(path.length, i + Math.floor(windowSize / 2) + 1);

        let sumX = 0, sumY = 0, count = 0;
        for (let j = start; j < end; j++) {
            if (path[j].x !== undefined && path[j].y !== undefined) {
                sumX += path[j].x;
                sumY += path[j].y;
                count++;
            }
        }

        if (count > 0) {
            smoothed.push({
                ...path[i],
                x: sumX / count,
                y: sumY / count
            });
        } else {
            smoothed.push(path[i]);
        }
    }
    return smoothed;
};

const MobileControlButton = React.memo(({ onClick, children, disabled, variant = 'primary' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            ...styles.mobileButton,
            ...(variant === 'secondary' ? styles.secondaryButton : {}),
            ...(disabled ? styles.disabledButton : {})
        }}
    >
        {children}
    </button>
));

const MobileAnalysisModal = React.memo(({ data, onReset }) => (
    <div style={styles.mobileModal}>
        <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Putt Analysis Complete</h2>
            <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                    <span style={styles.statLabel}>Average Direction:</span>
                    <span style={styles.statValue}>{data.averageDirection}°</span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statLabel}>Average Dispersion:</span>
                    <span style={styles.statValue}>{data.averageDispersion} px</span>
                </div>
            </div>
            <div style={styles.recommendation}>
                {data.recommendation}
            </div>
            <MobileControlButton onClick={onReset} style={{ marginTop: 20 }}>
                Start New Session
            </MobileControlButton>
        </div>
    </div>
));

export default function MobileOptimizedPuttAnalyzer() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const lastDetectionBox = useRef(null);
    const framesSinceDetection = useRef(0);
    const processingRequest = useRef(false);
    const detectionHistory = useRef([]);
    const lastProcessTime = useRef(Date.now());
    const animationFrameId = useRef(null);

    const [videoDevices, setVideoDevices] = useState([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [puttCount, setPuttCount] = useState(0);
    const [completedPaths, setCompletedPaths] = useState([]);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [cameraError, setCameraError] = useState('');
    const [currentPath, setCurrentPath] = useState([]);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [debugInfo, setDebugInfo] = useState({ detections: 0, confidence: 0, processing: false });

    const kf = useRef(new MobileOptimizedKalmanFilter());

    // Mobile-specific device detection
    const isMobile = useMemo(() => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth < 768;
    }, []);

    // Optimized video display dimensions for mobile
    const getVideoDisplayDimensions = useCallback(() => {
        if (!videoRef.current) return { 
            displayWidth: 0, 
            displayHeight: 0, 
            offsetX: 0, 
            offsetY: 0, 
            scale: 1,
            videoWidth: 0,
            videoHeight: 0
        };
        
        const video = videoRef.current;
        const containerWidth = video.clientWidth;
        const containerHeight = video.clientHeight;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        if (!videoWidth || !videoHeight) {
            return { 
                displayWidth: 0, 
                displayHeight: 0, 
                offsetX: 0, 
                offsetY: 0, 
                scale: 1,
                videoWidth: 0,
                videoHeight: 0
            };
        }
        
        const videoAspect = videoWidth / videoHeight;
        const containerAspect = containerWidth / containerHeight;

        let displayWidth, displayHeight, offsetX, offsetY;

        if (containerAspect > videoAspect) {
            displayHeight = containerHeight;
            displayWidth = containerHeight * videoAspect;
            offsetX = (containerWidth - displayWidth) / 2;
            offsetY = 0;
        } else {
            displayWidth = containerWidth;
            displayHeight = containerWidth / videoAspect;
            offsetY = (containerHeight - displayHeight) / 2;
            offsetX = 0;
        }

        return { 
            displayWidth, 
            displayHeight, 
            offsetX, 
            offsetY, 
            scale: displayWidth / videoWidth,
            videoWidth,
            videoHeight
        };
    }, []);

    const getCenterLineX = useCallback(() => {
        const displayInfo = getVideoDisplayDimensions();
        return displayInfo.offsetX + (displayInfo.displayWidth / 2);
    }, [getVideoDisplayDimensions]);

    // Mobile-optimized frame processing
    const shouldProcessFrame = useCallback(() => {
        const now = Date.now();
        const timeSinceLastProcess = now - lastProcessTime.current;
        const confidence = kf.current.getConfidence();
        
        // Conservative intervals for mobile
        let minInterval;
        if (confidence > 0.8) {
            minInterval = isMobile ? 150 : 80; // ~6-12 FPS
        } else if (confidence > 0.5) {
            minInterval = isMobile ? 120 : 60; // ~8-16 FPS
        } else {
            minInterval = isMobile ? 100 : 50; // ~10-20 FPS
        }
        
        return timeSinceLastProcess >= minInterval;
    }, [isMobile]);

    // Lenient validation for mobile cameras
    const isValidBallDetection = useCallback((detection, displayInfo) => {
        if (!detection.box || detection.box.length !== 4) return false;
        
        const [x1, y1, x2, y2] = detection.box;
        const width = x2 - x1;
        const height = y2 - y1;
        
        const displayWidth = width * displayInfo.scale;
        const displayHeight = height * displayInfo.scale;
        
        // Very lenient for mobile
        const minSize = 4;
        const maxSize = 250;
        const aspectRatio = displayWidth / displayHeight;
        
        const isValid = detection.confidence > 0.1 && // Very low threshold
                       displayWidth >= minSize && displayWidth <= maxSize &&
                       displayHeight >= minSize && displayHeight <= maxSize &&
                       aspectRatio > 0.2 && aspectRatio < 5; // Very lenient
        
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const isInBounds = centerX >= 0 && centerX <= displayInfo.videoWidth &&
                          centerY >= 0 && centerY <= displayInfo.videoHeight;
        
        return isValid && isInBounds;
    }, []);

    const updateCanvasDimensions = useCallback(() => {
        if (canvasRef.current && videoRef.current) {
            const rect = videoRef.current.getBoundingClientRect();
            canvasRef.current.width = rect.width;
            canvasRef.current.height = rect.height;
            setCanvasDimensions({ width: rect.width, height: rect.height });
        }
    }, []);

    // Enhanced mobile camera setup
    useEffect(() => {
        const enumerateDevices = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ video: true });
                
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter(d => d.kind === 'videoinput');
                
                // Prefer back camera on mobile
                if (isMobile && videoInputs.length > 1) {
                    const backCamera = videoInputs.find(device => 
                        device.label.toLowerCase().includes('back') || 
                        device.label.toLowerCase().includes('rear') ||
                        device.label.toLowerCase().includes('environment')
                    );
                    if (backCamera) {
                        const backIndex = videoInputs.indexOf(backCamera);
                        setCurrentDeviceIndex(backIndex);
                    }
                }
                
                setVideoDevices(videoInputs);
                if (videoInputs.length === 0) {
                    setCameraError("No camera found.");
                }
            } catch (err) {
                console.error('Error enumerating devices:', err);
                setCameraError("Camera access denied. Please allow camera permissions.");
            }
        };
        
        enumerateDevices();
    }, [isMobile]);

    useEffect(() => {
        if (videoDevices.length === 0) return;
        const deviceId = videoDevices[currentDeviceIndex]?.deviceId;
        if (!deviceId) return;

        const startCamera = async () => {
            setIsLoading(true);
            setCameraError('');
            
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }

            await new Promise(resolve => setTimeout(resolve, 200));

            try {
                const constraints = {
                    video: {
                        deviceId: { exact: deviceId },
                        width: { ideal: isMobile ? 720 : 1280, min: 480 },
                        height: { ideal: isMobile ? 480 : 720, min: 360 },
                        frameRate: { ideal: isMobile ? 24 : 30, min: 15 },
                        facingMode: isMobile ? 'environment' : 'user' // Prefer back camera on mobile
                    }
                };
                
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    
                    videoRef.current.onloadedmetadata = () => {
                        console.log('Mobile video ready:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                        setIsLoading(false);
                        updateCanvasDimensions();
                    };
                    
                    videoRef.current.onerror = (e) => {
                        console.error('Video error:', e);
                        setCameraError("Video error occurred");
                        setIsLoading(false);
                    };
                }
            } catch (err) {
                console.error('Camera error:', err);
                setCameraError(`Camera error: ${err.message}`);
                setIsLoading(false);
            }
        };
        
        startCamera();
    }, [videoDevices, currentDeviceIndex, updateCanvasDimensions, isMobile]);

    // Handle orientation changes on mobile
    useEffect(() => {
        const handleOrientationChange = () => {
            setTimeout(() => {
                updateCanvasDimensions();
            }, 500);
        };

        if (isMobile) {
            window.addEventListener('orientationchange', handleOrientationChange);
            window.addEventListener('resize', handleOrientationChange);
            return () => {
                window.removeEventListener('orientationchange', handleOrientationChange);
                window.removeEventListener('resize', handleOrientationChange);
            };
        } else {
            window.addEventListener('resize', updateCanvasDimensions);
            return () => window.removeEventListener('resize', updateCanvasDimensions);
        }
    }, [updateCanvasDimensions, isMobile]);

    const switchCamera = useCallback(() => {
        if (videoDevices.length < 2 || isRecording) return;
        setCurrentDeviceIndex(prev => (prev + 1) % videoDevices.length);
    }, [videoDevices, isRecording]);

    const handleToggleRecording = useCallback(() => {
        setIsRecording(prev => {
            const isStopping = prev;
            if (isStopping && currentPath.length > 1) {
                setCompletedPaths(paths => [...paths, currentPath]);
                setPuttCount(count => count + 1);
            }
            setCurrentPath([]);
            framesSinceDetection.current = 0;
            processingRequest.current = false;
            detectionHistory.current = [];
            kf.current = new MobileOptimizedKalmanFilter();
            return !isStopping;
        });
    }, [currentPath]);

    // Mobile-optimized detection processing
    useEffect(() => {
        if (!isRecording) return;

        const processFrame = async () => {
            if (processingRequest.current || !shouldProcessFrame()) {
                return;
            }

            if (!videoRef.current || videoRef.current.readyState < 2 || !videoRef.current.videoWidth) {
                return;
            }

            processingRequest.current = true;
            setDebugInfo(prev => ({ ...prev, processing: true }));
            lastProcessTime.current = Date.now();

            try {
                const tempCanvas = document.createElement("canvas");
                const video = videoRef.current;
                
                // Aggressive mobile optimization
                const scaleFactor = isMobile ? 0.4 : 0.7; // Much smaller for mobile
                const canvasWidth = Math.floor(video.videoWidth * scaleFactor);
                const canvasHeight = Math.floor(video.videoHeight * scaleFactor);
                
                tempCanvas.width = canvasWidth;
                tempCanvas.height = canvasHeight;
                const tempCtx = tempCanvas.getContext("2d");

                tempCtx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
                const displayInfo = getVideoDisplayDimensions();

                // Very low quality for mobile speed
                const jpegQuality = isMobile ? 0.5 : 0.8;
                
                tempCanvas.toBlob(async (blob) => {
                    if (!blob) {
                        processingRequest.current = false;
                        setDebugInfo(prev => ({ ...prev, processing: false }));
                        return;
                    }

                    const formData = new FormData();
                    formData.append("file", blob, "frame.jpg");

                    try {
                        const res = await axios.post(API_URL, formData, {
                            timeout: isMobile ? 4000 : 2500,
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        
                        const detections = res.data.detections;
                        setDebugInfo(prev => ({ 
                            ...prev, 
                            detections: detections?.length || 0,
                            processing: false 
                        }));

                        if (detections?.length > 0) {
                            const validDetections = detections.filter(det =>
                                isValidBallDetection(det, displayInfo)
                            );

                            if (validDetections.length > 0) {
                                framesSinceDetection.current = 0;

                                const bestDet = validDetections.reduce((a, b) =>
                                    a.confidence > b.confidence ? a : b
                                );

                                // Mobile coordinate transformation
                                const scaleRatio = video.videoWidth / canvasWidth;
                                const adjustedX = bestDet.x * scaleRatio;
                                const adjustedY = bestDet.y * scaleRatio;
                                
                                // Flip for front camera only if not using environment-facing camera
                                const shouldFlip = !isMobile || currentDeviceIndex === 0; // Front camera index
                                const flippedX = shouldFlip ? video.videoWidth - adjustedX : adjustedX;
                                const scaledX = displayInfo.offsetX + (flippedX * displayInfo.scale);
                                const scaledY = displayInfo.offsetY + (adjustedY * displayInfo.scale);
                                
                                // Update bounding box
                                if (bestDet.box && bestDet.box.length === 4) {
                                    const [x1, y1, x2, y2] = bestDet.box;
                                    const adjX1 = x1 * scaleRatio;
                                    const adjY1 = y1 * scaleRatio;
                                    const adjX2 = x2 * scaleRatio;
                                    const adjY2 = y2 * scaleRatio;
                                    
                                    const shouldFlip = !isMobile || currentDeviceIndex === 0; // Front camera index
                                    const flippedX1 = shouldFlip ? video.videoWidth - adjX2 : adjX1;
                                    const flippedX2 = shouldFlip ? video.videoWidth - adjX1 : adjX2;
                                    
                                    lastDetectionBox.current = [
                                        displayInfo.offsetX + (flippedX1 * displayInfo.scale),
                                        displayInfo.offsetY + (adjY1 * displayInfo.scale),
                                        displayInfo.offsetX + (flippedX2 * displayInfo.scale),
                                        displayInfo.offsetY + (adjY2 * displayInfo.scale)
                                    ];
                                }

                                const smoothed = kf.current.filter([scaledX, scaledY]);
                                setDebugInfo(prev => ({ 
                                    ...prev, 
                                    confidence: kf.current.getConfidence() 
                                }));

                                if (smoothed && smoothed.length >= 2) {
                                    setCurrentPath(prevPath => {
                                        const newPoint = {
                                            x: smoothed[0],
                                            y: smoothed[1],
                                            predicted: false,
                                            timestamp: Date.now(),
                                            confidence: bestDet.confidence
                                        };
                                        return [...prevPath, newPoint];
                                    });
                                }
                            } else {
                                handleMissedDetection();
                            }
                        } else {
                            handleMissedDetection();
                        }
                    } catch (error) {
                        console.warn('API failed:', error.message);
                        handleMissedDetection();
                    } finally {
                        processingRequest.current = false;
                        setDebugInfo(prev => ({ ...prev, processing: false }));
                    }
                }, "image/jpeg", jpegQuality);
            } catch (error) {
                console.error('Frame error:', error);
                processingRequest.current = false;
                setDebugInfo(prev => ({ ...prev, processing: false }));
            }
        };

        const handleMissedDetection = () => {
            framesSinceDetection.current++;
        
            if (kf.current.initialized && kf.current.getConfidence() > 0.4 && framesSinceDetection.current <= 6) {
                const predicted = kf.current.filter(null);
                if (predicted && predicted.length >= 2) {
                    setCurrentPath(prevPath => [...prevPath, {
                        x: predicted[0],
                        y: predicted[1],
                        predicted: true,
                        timestamp: Date.now()
                    }]);
                    return;
                }
            }
        
            if (framesSinceDetection.current > 12) {
                lastDetectionBox.current = null;
                kf.current.confidence *= 0.85;
            }
        };

        const intervalId = setInterval(processFrame, isMobile ? 80 : 50);
        return () => clearInterval(intervalId);
    }, [isRecording, shouldProcessFrame, isValidBallDetection, getVideoDisplayDimensions, isMobile]);

    // Mobile-optimized canvas drawing with requestAnimationFrame
    useEffect(() => {
        if (!canvasRef.current) return;

        const drawFrame = () => {
            const ctx = canvasRef.current.getContext("2d");
            const canvas = canvasRef.current;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const displayInfo = getVideoDisplayDimensions();
            
            if (displayInfo.displayWidth > 0 && displayInfo.displayHeight > 0) {
                // Draw center line - thicker for mobile
                const centerX = displayInfo.offsetX + (displayInfo.displayWidth / 2);
                
                ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
                ctx.lineWidth = isMobile ? 3 : 2;
                ctx.setLineDash([15, 15]);
                ctx.beginPath();
                ctx.moveTo(centerX, displayInfo.offsetY);
                ctx.lineTo(centerX, displayInfo.offsetY + displayInfo.displayHeight);
                ctx.stroke();
                ctx.setLineDash([]);

                // Draw starting point - larger for mobile
                const startPoint = {
                    x: centerX,
                    y: displayInfo.offsetY + displayInfo.displayHeight * 0.8
                };
                
                ctx.fillStyle = "rgba(0, 255, 255, 0.9)";
                ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";
                ctx.lineWidth = isMobile ? 4 : 3;
                ctx.beginPath();
                ctx.arc(startPoint.x, startPoint.y, isMobile ? 20 : 15, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = isMobile ? "18px Arial" : "14px Arial";
                ctx.textAlign = "center";
                ctx.fillText("START", startPoint.x, startPoint.y - (isMobile ? 35 : 25));
                ctx.textAlign = "left";
            }

            // Draw current path - thicker lines for mobile visibility
            if (currentPath.length >= 1) {
                const pathToDraw = currentPath.length > 3 ? smoothPath(currentPath, 2) : currentPath;

                if (pathToDraw.length >= 2) {
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";

                    for (let i = 1; i < pathToDraw.length; i++) {
                        const prevPoint = pathToDraw[i - 1];
                        const point = pathToDraw[i];
                        
                        if (prevPoint.x !== undefined && point.x !== undefined) {
                            if (point.predicted) {
                                ctx.strokeStyle = "rgba(255, 165, 0, 0.8)";
                                ctx.setLineDash([8, 8]);
                                ctx.lineWidth = isMobile ? 5 : 3;
                            } else {
                                const alpha = Math.min(1.0, (point.confidence || 0.5) + 0.4);
                                ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
                                ctx.setLineDash([]);
                                ctx.lineWidth = isMobile ? 6 : 4;
                            }
                            
                            ctx.beginPath();
                            ctx.moveTo(prevPoint.x, prevPoint.y);
                            ctx.lineTo(point.x, point.y);
                            ctx.stroke();
                        }
                    }
                    ctx.setLineDash([]);
                }

                // Draw start and end points - larger for mobile
                if (pathToDraw[0]?.x !== undefined) {
                    ctx.fillStyle = "rgba(0, 255, 0, 1.0)";
                    ctx.beginPath();
                    ctx.arc(pathToDraw[0].x, pathToDraw[0].y, isMobile ? 12 : 8, 0, 2 * Math.PI);
                    ctx.fill();
                }

                const lastPoint = pathToDraw[pathToDraw.length - 1];
                if (lastPoint?.x !== undefined) {
                    ctx.fillStyle = lastPoint.predicted ? "rgba(255, 165, 0, 1.0)" : "rgba(255, 0, 0, 1.0)";
                    ctx.beginPath();
                    ctx.arc(lastPoint.x, lastPoint.y, isMobile ? 10 : 6, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }

            // Simplified completed paths for mobile
            completedPaths.forEach((path, index) => {
                if (path.length >= 2) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + (index * 0.15)})`;
                    ctx.lineWidth = isMobile ? 3 : 2;
                    ctx.beginPath();
                    ctx.moveTo(path[0].x, path[0].y);
                    for (let i = 1; i < path.length; i++) {
                        if (path[i].x !== undefined && path[i].y !== undefined) {
                            ctx.lineTo(path[i].x, path[i].y);
                        }
                    }
                    ctx.stroke();
                }
            });

            // Detection box - thicker for mobile
            if (lastDetectionBox.current && framesSinceDetection.current < 5) {
                const [x1, y1, x2, y2] = lastDetectionBox.current;
                const confidence = kf.current.getConfidence();
                ctx.strokeStyle = `rgba(0, 255, 0, ${Math.min(1.0, confidence + 0.4)})`;
                ctx.lineWidth = isMobile ? 4 : 3;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            }

            // Mobile-optimized info display
            ctx.fillStyle = "white";
            ctx.font = isMobile ? "24px Arial" : "16px Arial";
            ctx.textAlign = "center";
            const topOffset = isMobile ? 40 : 30;
            ctx.fillText(`Putt ${puttCount + 1}/${MAX_PUTTS}`, canvasDimensions.width / 2, topOffset);
            
            if (currentPath.length > 0) {
                ctx.font = isMobile ? "20px Arial" : "16px Arial";
                ctx.fillText(`Points: ${currentPath.length}`, canvasDimensions.width / 2, topOffset + (isMobile ? 35 : 25));
            }
            
            if (isRecording) {
                ctx.fillStyle = "red";
                ctx.font = isMobile ? "22px Arial" : "16px Arial";
                ctx.fillText("● REC", canvasDimensions.width / 2, topOffset + (isMobile ? 70 : 50));
            }
            
            // Processing indicator for mobile
            if (isMobile && debugInfo.processing) {
                ctx.fillStyle = "orange";
                ctx.font = "18px Arial";
                ctx.fillText("Processing...", canvasDimensions.width / 2, topOffset + 105);
            }
        };

        if (isMobile) {
            // Use requestAnimationFrame for smoother mobile performance
            const animate = () => {
                drawFrame();
                animationFrameId.current = requestAnimationFrame(animate);
            };
            animationFrameId.current = requestAnimationFrame(animate);
            
            return () => {
                if (animationFrameId.current) {
                    cancelAnimationFrame(animationFrameId.current);
                }
            };
        } else {
            drawFrame();
        }
    }, [currentPath, completedPaths, puttCount, lastDetectionBox.current, isRecording, 
        framesSinceDetection.current, canvasDimensions, getVideoDisplayDimensions, debugInfo, isMobile]);

    // Analysis logic
    const analysisLogic = useMemo(() => {
        if (puttCount >= MAX_PUTTS && completedPaths.length > 0) {
            const centerX = getCenterLineX();

            const puttAnalyses = completedPaths.map(path => {
                if (!path || path.length < 2) return null;

                const startPoint = path[0];
                const endPoint = path[path.length - 1];

                if (!startPoint || !endPoint || 
                    typeof startPoint.x !== 'number' || typeof startPoint.y !== 'number' ||
                    typeof endPoint.x !== 'number' || typeof endPoint.y !== 'number') {
                    return null;
                }

                const deltaX = endPoint.x - startPoint.x;
                const deltaY = endPoint.y - startPoint.y;
                const angleRadians = Math.atan2(deltaX, -deltaY);
                const angleDegrees = angleRadians * (180 / Math.PI);
                const dispersion = Math.abs(endPoint.x - centerX);

                return { direction: angleDegrees, dispersion: dispersion };
            }).filter(analysis => analysis !== null);

            if (puttAnalyses.length === 0) return null;

            const avgDirection = puttAnalyses.reduce((sum, analysis) => sum + analysis.direction, 0) / puttAnalyses.length;
            const avgDispersion = puttAnalyses.reduce((sum, analysis) => sum + analysis.dispersion, 0) / puttAnalyses.length;

            let recommendation = "";
            if (avgDispersion > 30) {
                recommendation = "High dispersion detected. Focus on consistent stroke alignment and follow-through.";
            } else if (avgDispersion > 15) {
                recommendation = "Moderate dispersion. Work on maintaining steady hand position throughout the stroke.";
            } else {
                recommendation = "Excellent consistency! Your putting stroke is very stable.";
            }

            if (Math.abs(avgDirection) > 5) {
                const direction = avgDirection > 0 ? "right" : "left";
                recommendation += ` You tend to putt slightly to the ${direction}.`;
            }

            return {
                averageDirection: avgDirection.toFixed(1),
                averageDispersion: avgDispersion.toFixed(1),
                recommendation
            };
        }
        return null;
    }, [puttCount, completedPaths, getCenterLineX]);

    useEffect(() => {
        if (analysisLogic) {
            setAnalysisResult(analysisLogic);
        }
    }, [analysisLogic]);

    const resetSession = useCallback(() => {
        setPuttCount(0);
        setCompletedPaths([]);
        setCurrentPath([]);
        setAnalysisResult(null);
        setIsRecording(false);
        lastDetectionBox.current = null;
        framesSinceDetection.current = 0;
        processingRequest.current = false;
        detectionHistory.current = [];
        kf.current = new MobileOptimizedKalmanFilter();
        setDebugInfo({ detections: 0, confidence: 0, processing: false });
    }, []);

    return (
        <div style={styles.container}>
            {isLoading && (
                <div style={styles.loadingOverlay}>
                    <div style={styles.loadingSpinner}></div>
                    <div>Loading Camera...</div>
                </div>
            )}
            
            <video ref={videoRef} style={styles.video} muted playsInline autoPlay />
            <canvas ref={canvasRef} style={styles.canvas} />
            
            {analysisResult && <MobileAnalysisModal data={analysisResult} onReset={resetSession} />}
            
            {/* Mobile-optimized control panel */}
            <div style={styles.mobileControls}>
                <div style={styles.mainControl}>
                    <MobileControlButton 
                        onClick={handleToggleRecording} 
                        disabled={isLoading || puttCount >= MAX_PUTTS}
                    >
                        {isRecording ? "STOP RECORDING" : `RECORD PUTT ${puttCount + 1}`}
                    </MobileControlButton>
                </div>
                
                <div style={styles.secondaryControls}>
                    {videoDevices.length > 1 && (
                        <MobileControlButton 
                            onClick={switchCamera} 
                            disabled={isRecording || isLoading}
                            variant="secondary"
                        >
                            Switch Camera ({currentDeviceIndex + 1}/{videoDevices.length})
                        </MobileControlButton>
                    )}
                    
                    <MobileControlButton 
                        onClick={resetSession} 
                        disabled={isRecording}
                        variant="secondary"
                    >
                        Reset Session
                    </MobileControlButton>
                </div>
                
                {/* Mobile status bar */}
                <div style={styles.mobileStatusBar}>
                    <div style={styles.statusItem}>
                        <span style={styles.statusDot(debugInfo.confidence)}></span>
                        Tracking: {debugInfo.confidence > 0.5 ? 'Good' : 'Searching'}
                    </div>
                    {debugInfo.processing && (
                        <div style={styles.statusItem}>
                            <span style={styles.processingDot}></span>
                            Processing
                        </div>
                    )}
                </div>
            </div>
            
            {cameraError && (
                <div style={styles.errorOverlay}>
                    <div style={styles.errorMessage}>
                        <h3>Camera Error</h3>
                        <p>{cameraError}</p>
                        <MobileControlButton onClick={() => window.location.reload()}>
                            Retry
                        </MobileControlButton>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none"
    },
    video: {
        transform: "scaleX(-1)",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    canvas: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
        touchAction: "none"
    },
    mobileControls: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
        padding: "20px",
        paddingBottom: "30px"
    },
    mainControl: {
        marginBottom: "15px"
    },
    secondaryControls: {
        display: "flex",
        gap: "10px",
        marginBottom: "15px",
        flexWrap: "wrap"
    },
    mobileButton: {
        width: "100%",
        padding: "18px 20px",
        fontSize: "18px",
        fontWeight: "600",
        color: "#fff",
        backgroundColor: "#CB0000",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 12px rgba(203, 0, 0, 0.3)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        minHeight: "56px"
    },
    secondaryButton: {
        backgroundColor: "#444",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        flex: "1",
        minWidth: "140px",
        fontSize: "14px",
        padding: "14px 16px"
    },
    disabledButton: {
        backgroundColor: "#666",
        cursor: "not-allowed",
        opacity: 0.6,
        boxShadow: "none"
    },
    mobileStatusBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "14px",
        color: "rgba(255, 255, 255, 0.8)"
    },
    statusItem: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    statusDot: (confidence) => ({
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: confidence > 0.5 ? "#00ff00" : "#ffaa00"
    }),
    processingDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#ff6600",
        animation: "pulse 1s infinite"
    },
    mobileModal: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "30px 25px",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
    },
    modalTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#333",
        marginBottom: "25px"
    },
    statsContainer: {
        marginBottom: "25px"
    },
    statItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #eee",
        fontSize: "16px"
    },
    statLabel: {
        color: "#666",
        fontWeight: "500"
    },
    statValue: {
        color: "#333",
        fontWeight: "700",
        fontSize: "18px"
    },
    recommendation: {
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "12px",
        fontSize: "16px",
        lineHeight: "1.5",
        color: "#555",
        marginBottom: "25px"
    },
    loadingOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontSize: "18px",
        gap: "20px"
    },
    loadingSpinner: {
        width: "40px",
        height: "40px",
        border: "4px solid rgba(255, 255, 255, 0.3)",
        borderTop: "4px solid #CB0000",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    },
    errorOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
    },
    errorMessage: {
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "30px",
        textAlign: "center",
        maxWidth: "350px",
        width: "100%"
    }
};