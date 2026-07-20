import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Divider,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  LocalHospital as HospitalIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 250;

const NAV_ITEMS = [
  { label: "Dashboard",    icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Users",        icon: <PeopleIcon />,    path: "/users" },
  { label: "Appointments", icon: <CalendarIcon />,  path: "/appointments" },
];

export default function Layout({ children, setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setToken(null);
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 2.5,
          background: "linear-gradient(135deg, #1565C0 0%, #0288D1 100%)",
        }}
      >
        <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
          <HospitalIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
            Mini OPD
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Admin Panel
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav Items */}
      <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 2,
                py: 1.2,
                bgcolor: isActive ? "primary.main" : "transparent",
                color: isActive ? "#fff" : "text.primary",
                "&:hover": {
                  bgcolor: isActive ? "primary.dark" : "action.hover",
                },
                transition: "all 0.2s",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive ? "#fff" : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    ml: 1,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* Logout */}
      <Box sx={{ px: 2, py: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1.2,
            color: "error.main",
            "&:hover": { bgcolor: "error.lighter" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #1565C0 0%, #0288D1 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar>
          {/* Mobile menu toggle */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <HospitalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
            Online Mini OPD — Admin
          </Typography>

          <Chip
            label="Live"
            size="small"
            sx={{
              bgcolor: "#43A047",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              mr: 2,
              height: 22,
            }}
          />

          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Permanent Drawer — Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #E8ECF4",
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Temporary Drawer — Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "#F4F6F9",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
