import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export const lightTheme = {
  background: '#ffffff',
  surface: '#f5f5f5',
  border: '#e0e0e0',
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  accent: '#7F77DD',
  tabBar: '#ffffff',
};

export const darkTheme = {
  background: '#0a0a0f',
  surface: '#1a1a2e',
  border: '#2a2a4e',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
  textTertiary: '#666666',
  accent: '#7F77DD',
  tabBar: '#0a0a0f',
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}