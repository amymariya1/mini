import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('mm_theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('mm_theme', isDarkMode ? 'dark' : 'light');
    
    // Apply theme to document body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // Dark mode colors
      background: '#0f172a',
      cardBackground: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      primary: '#667eea',
      secondary: '#764ba2',
      cardHover: '#2d3748'
    } : {
      // Light mode colors
      background: '#ffffff',
      cardBackground: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      primary: '#667eea',
      secondary: '#764ba2',
      cardHover: '#f8fafc'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
