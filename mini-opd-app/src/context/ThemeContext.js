import React, { createContext, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  const [darkMode, setDarkMode] = useState(false);

  const theme = {
    darkMode,
    colors: darkMode
      ? {
          background: "#121212",
          card: "#1E1E1E",
          text: "#FFFFFF",
          secondaryText: "#B0BEC5",
          primary: "#90CAF9",
          danger: "#EF5350"
        }
      : {
          background: "#F4F7FB",
          card: "#FFFFFF",
          text: "#2C3E50",
          secondaryText: "#607D8B",
          primary: "#1976D2",
          danger: "#E53935"
        }
  };

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};