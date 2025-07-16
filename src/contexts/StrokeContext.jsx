import React, { createContext, useContext, useState, useEffect } from 'react';

// Key for localStorage
const STORAGE_KEY = 'runner-stroke-arc';

const StrokeContext = createContext();

export const StrokeProvider = ({ children }) => {
  const [arcResult, setArcResult] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setArcResult(JSON.parse(saved));
    }
  }, []);

  const saveArcResult = (result) => {
    setArcResult(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  };

  const clearArcResult = () => {
    setArcResult(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StrokeContext.Provider value={{ arcResult, saveArcResult, clearArcResult }}>
      {children}
    </StrokeContext.Provider>
  );
};

export const useStroke = () => useContext(StrokeContext); 