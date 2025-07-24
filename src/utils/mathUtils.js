/**
 * Computes statistics for ball trajectory analysis
 * @param {Array} points - Array of {x, y} points
 * @returns {Object} Object containing average x-position, dispersion, and direction
 */
export function computeBallStats(points) {
  if (!points || points.length === 0) {
    return { avgX: 0, dispersion: 0, direction: 'None' };
  }

  const xs = points.map((pt) => pt.x);
  const avgX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const dispersion = Math.sqrt(
    xs.reduce((acc, val) => acc + (val - avgX) ** 2, 0) / xs.length
  );
  
  // Determine direction based on first and last point
  let direction = 'None';
  if (points.length > 1) {
    direction = xs[0] < xs[xs.length - 1] ? 'Right' : 'Left';
  }
  
  return { 
    avgX, 
    dispersion, 
    direction 
  };
}
