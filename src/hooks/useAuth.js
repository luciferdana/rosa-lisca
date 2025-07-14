import { useState, useEffect } from 'react';
import { dummyData } from '../data/dummyData';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('rosa_lisca_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('rosa_lisca_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (email === dummyData.admin.email && password === dummyData.admin.password) {
      const userData = { email };
      setIsAuthenticated(true);
      setUser(userData);
      
      // Save to localStorage for persistence
      localStorage.setItem('rosa_lisca_user', JSON.stringify(userData));
      
      return { success: true };
    }
    
    return { 
      success: false, 
      error: 'Email atau password salah' 
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('rosa_lisca_user');
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };
};