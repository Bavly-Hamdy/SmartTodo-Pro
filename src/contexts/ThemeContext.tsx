import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [isDark, setIsDark] = useState(false);

  // Check if user prefers dark mode
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Auto theme logic
  const getAutoTheme = (): boolean => {
    if (theme !== 'auto') return theme === 'dark';
    
    // Check time-based auto switching (6 PM to 6 AM = dark mode)
    const hour = new Date().getHours();
    const isNightTime = hour >= 18 || hour < 6;
    
    return isNightTime || prefersDark;
  };

  // Apply theme to document
  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    
    if (dark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    setIsDark(dark);
  };

  // Set theme and save to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const shouldBeDark = getAutoTheme();
    applyTheme(shouldBeDark);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }

    // Apply initial theme
    const shouldBeDark = getAutoTheme();
    applyTheme(shouldBeDark);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        const shouldBeDark = getAutoTheme();
        applyTheme(shouldBeDark);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Time-based theme switching for auto mode
    const checkTimeBasedTheme = () => {
      if (theme === 'auto') {
        const shouldBeDark = getAutoTheme();
        applyTheme(shouldBeDark);
      }
    };

    // Check every minute for time-based changes
    const interval = setInterval(checkTimeBasedTheme, 60000);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearInterval(interval);
    };
  }, [theme, prefersDark]);

  const value: ThemeContextType = {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 