/**
 * Draws a ball path on the canvas
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
 * @param {Object} pt - The point to draw {x, y}
 * @param {string} [color='red'] - The color of the ball
 * @param {number} [radius=5] - The radius of the ball
 */
export function drawBallPath(ctx, pt, color = 'red', radius = 5) {
  if (!ctx || !pt) return;
  
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

/**
 * Clears the entire canvas
 * @param {HTMLCanvasElement} canvas - The canvas element to clear
 */
export function clearCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Sets up canvas dimensions to match video element
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {HTMLVideoElement} video - The video element
 */
export function setupCanvasDimensions(canvas, video) {
  if (!canvas || !video) return;
  
  // Set canvas dimensions to match video display size
  canvas.width = video.videoWidth || video.offsetWidth;
  canvas.height = video.videoHeight || video.offsetHeight;
}
