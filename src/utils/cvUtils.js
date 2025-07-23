const getCenterContour = (contours) => {
    let maxArea = 0;
    let maxContour = null;
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      if (area > maxArea) {
        maxArea = area;
        maxContour = contour;
      } else {
        contour.delete();
      }
    }
    return maxContour;
  }
  
 const getAngle = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }
 
 const cleanupMats = (...mats) => {
    mats.forEach(mat => mat && typeof mat.delete === 'function' && mat.delete());
  }
  export { cleanupMats, getAngle, getCenterContour };