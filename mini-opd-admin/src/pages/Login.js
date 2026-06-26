import React, { useState } from "react";
import { Box, TextField, Button, Paper, Typography } from "@mui/material";
import { loginAdmin } from "../services/api";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginAdmin(email, password);

      if (res.data.user.role !== "admin") {
        alert("Access denied ❌");
        return;
      }

      setToken(res.data.token);
    } catch {
      alert("Login failed ❌");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F4F6F7",
      }}
    >
      <Paper sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Admin Login
        </Typography>

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
}