import { createContext, useContext, useState } from 'react';

// 1. Create the context
const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
});

// 2. Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Stubbed login: replace with real API call later
  const login = async ({ username, password }) => {
    // simulate network delay
    await new Promise((r) => setTimeout(r, 300));

    // hard-coded stub: accept anything for now
    setUser({ name: username });
    return { success: true };
  };

  // Stubbed logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default export for backward compatibility
export default AuthProvider;
