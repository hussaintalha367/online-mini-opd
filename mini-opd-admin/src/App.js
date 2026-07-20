import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Appointments from "./pages/Appointments";

function App() {
  const [token, setToken] = useState(null);

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login setToken={setToken} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout setToken={setToken}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<Dashboard    token={token} />} />
            <Route path="/users"        element={<Users        token={token} />} />
            <Route path="/appointments" element={<Appointments token={token} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
