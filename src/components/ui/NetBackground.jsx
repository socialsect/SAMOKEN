import React, { useRef, useEffect } from 'react';
import './NetBackground.css';

const DOTS = 80;
const DOT_RADIUS = 3;
const LINE_DISTANCE = 150;
const DOT_COLOR = 'rgba(255, 255, 255, 0.8)';
const LINE_COLOR = 'rgba(255, 255, 255, 0.15)';

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
  const animationId = useRef(null);
  const mouse = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    function initDots() {
      dots.current = Array(DOTS).fill().map(() => ({
        x: randomPos(canvas.width),
        y: randomPos(canvas.height),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < dots.current.length; i++) {
        for (let j = i + 1; j < dots.current.length; j++) {
          const dist = distance(dots.current[i], dots.current[j]);
          if (dist < LINE_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(dots.current[i].x, dots.current[i].y);
            ctx.lineTo(dots.current[j].x, dots.current[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / LINE_DISTANCE})`;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      ctx.fillStyle = DOT_COLOR;
      dots.current.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function update() {
      const now = Date.now() * 0.001;
      
      dots.current.forEach(dot => {
        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
        
        // Apply mouse influence
        if (isHovering.current && mouse.current.x && mouse.current.y) {
          const dx = mouse.current.x - dot.x;
          const dy = mouse.current.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            const angle = Math.atan2(dy, dx);
            const force = (1 - dist / 150) * 0.5;
            dot.vx -= Math.cos(angle) * force;
            dot.vy -= Math.sin(angle) * force;
          }
        }
        
        // Add some random movement
        dot.vx += (Math.random() - 0.5) * 0.1;
        dot.vy += (Math.random() - 0.5) * 0.1;
        
        // Apply friction
        dot.vx *= 0.98;
        dot.vy *= 0.98;
        
        // Pulsing effect
        dot.pulse += 0.02;
        dot.opacity = 0.3 + Math.sin(dot.pulse) * 0.2;
      });
    }

    function animate() {
      update();
      draw();
      animationId.current = requestAnimationFrame(animate);
    }

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Calculate mouse velocity
      const now = Date.now();
      if (lastMouse.current.time) {
        const dt = now - lastMouse.current.time;
        if (dt > 0) {
          mouseVelocity.current = {
            x: (mouse.current.x - lastMouse.current.x) / dt,
            y: (mouse.current.y - lastMouse.current.y) / dt
          };
        }
      }
      
      lastMouse.current = {
        x: mouse.current.x,
        y: mouse.current.y,
        time: now
      };
    }

    // Initialize
    resizeCanvas();
    initDots();
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', () => { isHovering.current = true; });
    canvas.addEventListener('mouseleave', () => { isHovering.current = false; });
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', () => {});
      canvas.removeEventListener('mouseleave', () => {});
      cancelAnimationFrame(animationId.current);
    };
  }, []);

  return (
    <div className="net-background">
      <canvas ref={canvasRef} className="net-canvas" />
    </div>
  );
};

export default NetBackground;
