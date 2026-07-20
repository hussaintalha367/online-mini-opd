import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import {
  People as PeopleIcon,
  LocalHospital as DoctorIcon,
  Person as PatientIcon,
  CalendarMonth as CalendarIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  DoneAll as CompletedIcon,
} from "@mui/icons-material";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { getAllUsers, getAllAppointments } from "../services/api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const StatCard = ({ icon, label, value, color, bg }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      bgcolor: bg,
      border: `1px solid ${color}22`,
      height: "100%",
    }}
  >
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
      <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
      <Box>
        <Typography variant="h4" fontWeight={700} color={color}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, apptRes] = await Promise.all([
          getAllUsers(token),
          getAllAppointments(token),
        ]);
        setUsers(usersRes.data || []);
        setAppointments(apptRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const totalDoctors  = users.filter((u) => u.role === "doctor").length;
  const totalPatients = users.filter((u) => u.role === "patient").length;
  const approved  = appointments.filter((a) => a.status === "approved").length;
  const pending   = appointments.filter((a) => a.status === "pending").length;
  const rejected  = appointments.filter((a) => a.status === "rejected").length;
  const completed = appointments.filter((a) => a.status === "completed").length;

  const userChartData = {
    labels: ["Doctors", "Patients"],
    datasets: [{
      data: [totalDoctors, totalPatients],
      backgroundColor: ["#1565C0", "#00897B"],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const apptChartData = {
    labels: ["Approved", "Pending", "Rejected", "Completed"],
    datasets: [{
      label: "Appointments",
      data: [approved, pending, rejected, completed],
      backgroundColor: ["#43A047", "#FB8C00", "#E53935", "#1565C0"],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10, flexDirection: "column", alignItems: "center", gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening today.
        </Typography>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { icon: <PeopleIcon sx={{ color: "#fff" }} />,   label: "Total Users",       value: users.length,       color: "#4A148C", bg: "#F3E5F5" },
          { icon: <DoctorIcon sx={{ color: "#fff" }} />,   label: "Doctors",           value: totalDoctors,       color: "#1565C0", bg: "#E3F2FD" },
          { icon: <PatientIcon sx={{ color: "#fff" }} />,  label: "Patients",          value: totalPatients,      color: "#00695C", bg: "#E0F2F1" },
          { icon: <CalendarIcon sx={{ color: "#fff" }} />, label: "Total Appointments",value: appointments.length,color: "#37474F", bg: "#ECEFF1" },
          { icon: <PendingIcon sx={{ color: "#fff" }} />,  label: "Pending",           value: pending,            color: "#E65100", bg: "#FFF3E0" },
          { icon: <ApprovedIcon sx={{ color: "#fff" }} />, label: "Approved",          value: approved,           color: "#2E7D32", bg: "#E8F5E9" },
          { icon: <RejectedIcon sx={{ color: "#fff" }} />, label: "Rejected",          value: rejected,           color: "#B71C1C", bg: "#FFEBEE" },
          { icon: <CompletedIcon sx={{ color: "#fff" }} />,label: "Completed",         value: completed,          color: "#0277BD", bg: "#E1F5FE" },
        ].map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* ── Charts ── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              User Distribution
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ maxWidth: 280, mx: "auto" }}>
              <Pie
                data={userChartData}
                options={{ plugins: { legend: { position: "bottom" } } }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Appointment Status Breakdown
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Bar
              data={apptChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "#F0F0F0" },
                    ticks: { stepSize: 1 },
                  },
                  x: { grid: { display: false } },
                },
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
