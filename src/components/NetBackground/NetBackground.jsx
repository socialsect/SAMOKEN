import React, { useRef, useEffect } from "react";

const DOTS = 80;
const DOT_RADIUS = 3;
const LINE_DISTANCE = 150;
const CANVAS_BG = "#ffffff";
const DOT_COLOR = "#000000";
const LINE_COLOR = "rgba(0,0,0,0.2)";

function randomPos(dimension) {
  return Math.random() * dimension;
}

function distance(dotA, dotB) {
  return Math.sqrt(Math.pow(dotA.x - dotB.x, 2) + Math.pow(dotA.y - dotB.y, 2));
}

const NetBackground = () => {
  const canvasRef = useRef(null);
  const dots = useRef([]);
  const isHovering = useRef(false);
  const mouseVelocity = useRef({ x: 0, y: 0 });
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let mouse = { x: null, y: null };

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize dots with more properties
    function initDots() {
      dots.current = Array(DOTS)
        .fill()
        .map(() => ({
          x: randomPos(canvas.width),
          y: randomPos(canvas.height),
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 2 + 1, // Variable dot sizes
          opacity: Math.random() * 0.5 + 0.3, // Variable opacity
          pulse: Math.random() * Math.PI * 2, // For pulsing effect
          pulseSpeed: Math.random() * 0.05 + 0.02, // Pulse speed
        }));
    }
    initDots();

    // Animation
    function draw() {
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Only draw dots and lines when hovering
      if (isHovering.current && mouse.x !== null && mouse.y !== null) {
        // Calculate mouse velocity for dynamic effects
        mouseVelocity.current.x = mouse.x - lastMouse.current.x;
        mouseVelocity.current.y = mouse.y - lastMouse.current.y;
        lastMouse.current.x = mouse.x;
        lastMouse.current.y = mouse.y;

        // Draw and move dots
        dots.current.forEach((dot) => {
          dot.x += dot.vx;
          dot.y += dot.vy;
          dot.pulse += dot.pulseSpeed;

          // Bounce off edges
          if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
          if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

          // Keep dots within bounds
          dot.x = Math.max(0, Math.min(canvas.width, dot.x));
          dot.y = Math.max(0, Math.min(canvas.height, dot.y));

          // Only draw dots that are near the mouse
          const distToMouse = distance(mouse, dot);
          if (distToMouse < LINE_DISTANCE * 2) {
            // Calculate dynamic size based on distance and pulse
            const pulseEffect = Math.sin(dot.pulse) * 0.5 + 1;
            const distanceEffect = Math.max(0, 1 - distToMouse / (LINE_DISTANCE * 2));
            const dynamicSize = dot.size * pulseEffect * (0.5 + distanceEffect * 0.5);

            // Calculate opacity based on distance
            const dynamicOpacity = dot.opacity * distanceEffect;

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dynamicSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,0,0,${dynamicOpacity})`;
            ctx.fill();

            // Add subtle glow effect for closer dots
            if (distToMouse < LINE_DISTANCE * 0.5) {
              ctx.beginPath();
              ctx.arc(dot.x, dot.y, dynamicSize * 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0,0,0,${dynamicOpacity * 0.1})`;
              ctx.fill();
            }
          }
        });

        // Draw lines only between dots near the mouse
        const nearbyDots = dots.current.filter(dot => 
          distance(mouse, dot) < LINE_DISTANCE * 2
        );

        for (let i = 0; i < nearbyDots.length; i++) {
          for (let j = i + 1; j < nearbyDots.length; j++) {
            const dist = distance(nearbyDots[i], nearbyDots[j]);
            if (dist < LINE_DISTANCE) {
              // Calculate line opacity based on distance
              const lineOpacity = Math.max(0, 1 - dist / LINE_DISTANCE) * 0.3;
              
              ctx.beginPath();
              ctx.moveTo(nearbyDots[i].x, nearbyDots[i].y);
              ctx.lineTo(nearbyDots[j].x, nearbyDots[j].y);
              ctx.strokeStyle = `rgba(0,0,0,${lineOpacity})`;
              ctx.lineWidth = Math.max(0.5, 2 * (1 - dist / LINE_DISTANCE));
              ctx.stroke();
            }
          }
        }

        // Draw enhanced lines from mouse to nearest dots
        dots.current.forEach((dot) => {
          const dist = distance(mouse, dot);
          if (dist < LINE_DISTANCE) {
            // Calculate line properties based on distance
            const lineOpacity = Math.max(0, 1 - dist / LINE_DISTANCE) * 0.6;
            const lineWidth = Math.max(1, 3 * (1 - dist / LINE_DISTANCE));
            
            // Add velocity-based color variation
            const velocity = Math.sqrt(mouseVelocity.current.x ** 2 + mouseVelocity.current.y ** 2);
            const colorIntensity = Math.min(1, velocity * 0.1);
            
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(dot.x, dot.y);
            ctx.strokeStyle = `rgba(0,0,0,${lineOpacity + colorIntensity * 0.2})`;
            ctx.lineWidth = lineWidth;
            ctx.stroke();

            // Add subtle glow effect for very close connections
            if (dist < LINE_DISTANCE * 0.3) {
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(dot.x, dot.y);
              ctx.strokeStyle = `rgba(0,0,0,${lineOpacity * 0.3})`;
              ctx.lineWidth = lineWidth * 3;
              ctx.stroke();
            }
          }
        });

        // Add subtle ripple effect around mouse
        const rippleRadius = Math.sin(Date.now() * 0.005) * 20 + 50;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,0,0,0.05)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // When not hovering, just move dots without drawing them
        dots.current.forEach((dot) => {
          dot.x += dot.vx;
          dot.y += dot.vy;
          dot.pulse += dot.pulseSpeed;

          if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
          if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

          dot.x = Math.max(0, Math.min(canvas.width, dot.x));
          dot.y = Math.max(0, Math.min(canvas.height, dot.y));
        });
      }

      animationId = requestAnimationFrame(draw);
    }
    draw();

    // Mouse movement
    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      isHovering.current = true;
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      mouse.x = null;
      mouse.y = null;
      mouseVelocity.current = { x: 0, y: 0 };
    };

    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="net-background"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        display: "block",
      }}
    />
  );
};

export default NetBackground; 