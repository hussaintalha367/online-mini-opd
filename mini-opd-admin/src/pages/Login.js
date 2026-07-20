import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  LocalHospital as HospitalIcon,
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { loginAdmin } from "../services/api";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.data.user.role !== "admin") {
        setError("Access denied. Admin accounts only.");
        return;
      }
      setToken(res.data.token);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1565C0 0%, #0288D1 60%, #26A69A 100%)",
        px: 2,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1565C0 0%, #0288D1 100%)",
            py: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          >
            <HospitalIcon sx={{ color: "#fff", fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            Mini OPD Admin
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Secure Administrator Access
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ px: 4, py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <AdminIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Sign in to continue
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            margin="normal"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPass ? "text" : "password"}
            value={password}
            margin="normal"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { borderRadius: 2 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontSize: 15,
              fontWeight: 700,
              background: "linear-gradient(90deg, #1565C0 0%, #0288D1 100%)",
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(21,101,192,0.35)",
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
