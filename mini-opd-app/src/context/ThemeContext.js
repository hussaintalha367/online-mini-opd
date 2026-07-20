import React, { createContext, useState } from "react";

export const ThemeContext = createContext();

const lightTheme = {
  background: "#F4F6F7",
  card: "#FFFFFF",
  text: "#2C3E50",
  primary: "#2E86C1",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#E74C3C",
};

const darkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  primary: "#2E86C1",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#E74C3C",
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: darkMode ? darkTheme : lightTheme,
        darkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};