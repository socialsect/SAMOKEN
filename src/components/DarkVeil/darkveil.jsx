import { useRef, useEffect } from "react";
import "./darkveil.css";

export default function DarkVeil({
  intensity = 0.4,
  speed = 0.6,
  glowIntensity = 0.12,
  patternOpacity = 0.025
}) {
  const ref = useRef(null);
  
  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let startTime = Date.now();
    
    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w;
      canvas.height = h;
    };
    
    const draw = () => {
      const time = (Date.now() - startTime) * speed * 0.001;
      const w = canvas.width;
      const h = canvas.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, w, h);
      
      // Create rich gradient background with multiple layers
      const gradient1 = ctx.createLinearGradient(0, 0, w, h);
      gradient1.addColorStop(0, 'rgba(10, 10, 10, 0.9)');
      gradient1.addColorStop(0.3, 'rgba(20, 20, 20, 0.7)');
      gradient1.addColorStop(0.7, 'rgba(26, 26, 26, 0.6)');
      gradient1.addColorStop(1, 'rgba(10, 10, 10, 0.9)');
      
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, w, h);
      
      // Add diagonal flowing gradient
      const gradient2 = ctx.createLinearGradient(
        w * 0.5 + Math.sin(time * 0.2) * 100, 
        h * 0.5 + Math.cos(time * 0.15) * 80, 
        w * 0.5 + Math.sin(time * 0.3) * 120, 
        h * 0.5 + Math.cos(time * 0.25) * 100
      );
      gradient2.addColorStop(0, 'rgba(15, 15, 15, 0.4)');
      gradient2.addColorStop(0.5, 'rgba(25, 25, 25, 0.2)');
      gradient2.addColorStop(1, 'rgba(15, 15, 15, 0.4)');
      
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, w, h);
      
      // Enhanced animated glow effects with better positioning
      const glowGradient1 = ctx.createRadialGradient(
        w * 0.25 + Math.sin(time * 0.4) * 80, 
        h * 0.75 + Math.cos(time * 0.3) * 60, 
        0, 
        w * 0.25 + Math.sin(time * 0.4) * 80, 
        h * 0.75 + Math.cos(time * 0.3) * 60, 
        250
      );
      glowGradient1.addColorStop(0, `rgba(239, 76, 35, ${glowIntensity})`);
      glowGradient1.addColorStop(0.6, `rgba(239, 76, 35, ${glowIntensity * 0.3})`);
      glowGradient1.addColorStop(1, 'rgba(239, 76, 35, 0)');
      
      ctx.fillStyle = glowGradient1;
      ctx.fillRect(0, 0, w, h);
      
      const glowGradient2 = ctx.createRadialGradient(
        w * 0.75 + Math.sin(time * 0.5) * 70, 
        h * 0.25 + Math.cos(time * 0.4) * 50, 
        0, 
        w * 0.75 + Math.sin(time * 0.5) * 70, 
        h * 0.25 + Math.cos(time * 0.4) * 50, 
        220
      );
      glowGradient2.addColorStop(0, `rgba(255, 107, 53, ${glowIntensity * 0.8})`);
      glowGradient2.addColorStop(0.6, `rgba(255, 107, 53, ${glowIntensity * 0.2})`);
      glowGradient2.addColorStop(1, 'rgba(255, 107, 53, 0)');
      
      ctx.fillStyle = glowGradient2;
      ctx.fillRect(0, 0, w, h);
      
      // Add subtle center glow
      const centerGlow = ctx.createRadialGradient(
        w * 0.5 + Math.sin(time * 0.1) * 20, 
        h * 0.5 + Math.cos(time * 0.08) * 15, 
        0, 
        w * 0.5 + Math.sin(time * 0.1) * 20, 
        h * 0.5 + Math.cos(time * 0.08) * 15, 
        300
      );
      centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
      centerGlow.addColorStop(0.7, 'rgba(255, 255, 255, 0.01)');
      centerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);
      
      // Enhanced animated pattern overlay with flowing dots
      ctx.save();
      ctx.globalAlpha = patternOpacity;
      ctx.fillStyle = '#fa2132 ';
      
      const patternSize = 60;
      const offsetX = (time * 25) % patternSize;
      const offsetY = (time * 20) % patternSize;
      
      for (let x = -patternSize + offsetX; x < w + patternSize; x += patternSize) {
        for (let y = -patternSize + offsetY; y < h + patternSize; y += patternSize) {
          if (Math.random() > 0.6) {
            const size = 0.8 + Math.sin(time + x * 0.01) * 0.4;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Add flowing lines
      ctx.strokeStyle = '#fa2132 ';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = patternOpacity * 0.6;
      
      for (let i = 0; i < 3; i++) {
        const lineY = h * 0.3 + i * h * 0.2 + Math.sin(time * 0.5 + i) * 30;
        ctx.beginPath();
        ctx.moveTo(-50, lineY);
        ctx.lineTo(w + 50, lineY + Math.sin(time * 0.3 + i * 0.5) * 20);
        ctx.stroke();
      }
      
      ctx.restore();
      
      // Enhanced noise texture with better distribution
      ctx.save();
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < w * h / 8000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const alpha = 0.3 + Math.random() * 0.4;
        const size = 0.5 + Math.random() * 1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(x, y, size, size);
      }
      ctx.restore();
      
      // Add subtle wave effect
      ctx.save();
      ctx.globalAlpha = 0.03;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const y = h * 0.2 + i * h * 0.6 + Math.sin((x + time * 50) * 0.01) * 15;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();
      
      animationId = requestAnimationFrame(draw);
    };
    
    resize();
    draw();
    
    window.addEventListener('resize', resize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [intensity, speed, glowIntensity, patternOpacity]);
  
  return (
    <canvas
      ref={ref}
      className="darkveil-canvas"
    />
  );
}
