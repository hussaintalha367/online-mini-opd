import React, { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Appointments from "./pages/Appointments";
import Layout from "./components/Layout";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

function App() {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("dashboard");

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <Login setToken={setToken} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Layout setPage={setPage}>
        {page === "dashboard" && <Dashboard token={token} />}
        {page === "users" && <Users token={token} />}
        {page === "appointments" && <Appointments token={token} />}
      </Layout>
    </ThemeProvider>
  );
}

export default App;