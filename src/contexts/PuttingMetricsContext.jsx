import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultMetrics = {
  arcType: true,
  faceAngle: true,
  ballDirection: true,
  strokeRatio: true,
  dynamicControl: true,
  puttPerformance: true
};

const PuttingMetricsContext = createContext();

export const PuttingMetricsProvider = ({ children }) => {
  const [puttingMetrics, setPuttingMetrics] = useState(defaultMetrics);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('puttingMetrics');
    if (saved) setPuttingMetrics(JSON.parse(saved));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('puttingMetrics', JSON.stringify(puttingMetrics));
  }, [puttingMetrics]);

  const updateMetric = (metric, value) => {
    setPuttingMetrics(prev => ({ ...prev, [metric]: value }));
  };

  return (
    <PuttingMetricsContext.Provider value={{ puttingMetrics, updateMetric }}>
      {children}
    </PuttingMetricsContext.Provider>
  );
};

export const usePuttingMetrics = () => useContext(PuttingMetricsContext); 