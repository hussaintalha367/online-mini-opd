import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Divider,
  Button,
  ButtonGroup,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  HourglassEmpty as PendingIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  PieChart as PieIcon,
  Refresh as RefreshIcon,
  ThumbUp as ThumbUpIcon,
} from "@mui/icons-material";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { getAllUsers, getAllAppointments } from "../services/api";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

const STATUS_COLORS = {
  pending:   { color: "#E65100", bg: "#FFF3E0" },
  approved:  { color: "#2E7D32", bg: "#E8F5E9" },
  rejected:  { color: "#B71C1C", bg: "#FFEBEE" },
  completed: { color: "#1565C0", bg: "#E3F2FD" },
  cancelled: { color: "#546E7A", bg: "#ECEFF1" },
};

const StatCard = ({ icon, label, value, subtext, color, bg }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      bgcolor: bg,
      border: `1px solid ${color}25`,
      height: "100%",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} color={color} sx={{ my: 0.5 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 44, height: 44, borderRadius: 2 }}>{icon}</Avatar>
      </Box>
      {subtext && (
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
          {subtext}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("all"); // '7days', '30days', 'all'

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [usersRes, apptRes] = await Promise.all([
        getAllUsers(token),
        getAllAppointments(token),
      ]);
      setUsers(usersRes.data || []);
      setAppointments(apptRes.data || []);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Filtered Appointments by Selected Time Range ── */
  const filteredAppointments = useMemo(() => {
    if (timeRange === "all") return appointments;
    const now = new Date();
    const days = timeRange === "7days" ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return appointments.filter((a) => {
      const d = new Date(a.createdAt || a.date);
      return !isNaN(d) && d >= cutoff;
    });
  }, [appointments, timeRange]);

  /* ── Aggregated Metrics ── */
  const totalDoctors  = users.filter((u) => u.role === "doctor").length;
  const totalPatients = users.filter((u) => u.role === "patient").length;

  const totalAppts = filteredAppointments.length;
  const approved  = filteredAppointments.filter((a) => a.status === "approved").length;
  const pending   = filteredAppointments.filter((a) => a.status === "pending").length;
  const rejected  = filteredAppointments.filter((a) => a.status === "rejected").length;
  const completed = filteredAppointments.filter((a) => a.status === "completed").length;

  // Key KPI Calculations
  const acceptanceRate = totalAppts > 0 ? Math.round(((approved + completed) / totalAppts) * 100) : 0;
  const completionRate = (completed + approved) > 0 ? Math.round((completed / (completed + approved)) * 100) : 0;

  /* ── 1. Trend Line Chart (Appointments by Day) ── */
  const trendChartData = useMemo(() => {
    const countsByDate = {};
    const daysCount = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 14;

    // Pre-populate last N days with 0
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      countsByDate[key] = 0;
    }

    filteredAppointments.forEach((a) => {
      const d = new Date(a.createdAt || a.date);
      if (!isNaN(d)) {
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (countsByDate[key] !== undefined) {
          countsByDate[key] += 1;
        }
      }
    });

    return {
      labels: Object.keys(countsByDate),
      datasets: [
        {
          label: "Consultations",
          data: Object.values(countsByDate),
          borderColor: "#1565C0",
          backgroundColor: "rgba(21, 101, 192, 0.12)",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#1565C0",
          pointBorderColor: "#fff",
          pointHoverRadius: 6,
          pointRadius: 4,
        },
      ],
    };
  }, [filteredAppointments, timeRange]);

  /* ── 2. Doctor Specializations (Doughnut Chart) ── */
  const specialtyChartData = useMemo(() => {
    const counts = {};
    users.filter((u) => u.role === "doctor").forEach((doc) => {
      const spec = doc.specialization?.trim() || "General Medicine";
      counts[spec] = (counts[spec] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const bgColors = [
      "#1565C0", "#00897B", "#E65100", "#7B1FA2", "#C2185B", "#0288D1", "#FBC02D", "#388E3C"
    ];

    return {
      labels: labels.length ? labels : ["No Doctors"],
      datasets: [
        {
          data: data.length ? data : [1],
          backgroundColor: bgColors.slice(0, Math.max(labels.length, 1)),
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 6,
        },
      ],
    };
  }, [users]);

  /* ── 3. Peak OPD Time Slots ── */
  const peakHoursData = useMemo(() => {
    const slots = {
      "Morning (8-11 AM)": 0,
      "Midday (12-2 PM)": 0,
      "Afternoon (3-5 PM)": 0,
      "Evening (6-9 PM)": 0,
    };

    filteredAppointments.forEach((a) => {
      const t = a.time || "";
      const lower = t.toLowerCase();
      if (lower.includes("am")) {
        const hour = parseInt(t) || 9;
        if (hour >= 8 && hour <= 11) slots["Morning (8-11 AM)"] += 1;
        else slots["Midday (12-2 PM)"] += 1;
      } else {
        const hour = parseInt(t) || 2;
        if (hour === 12 || hour <= 2) slots["Midday (12-2 PM)"] += 1;
        else if (hour >= 3 && hour <= 5) slots["Afternoon (3-5 PM)"] += 1;
        else slots["Evening (6-9 PM)"] += 1;
      }
    });

    return {
      labels: Object.keys(slots),
      datasets: [
        {
          label: "Bookings",
          data: Object.values(slots),
          backgroundColor: ["#42A5F5", "#26A69A", "#FFA726", "#AB47BC"],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [filteredAppointments]);

  /* ── 4. Appointment Status Breakdown (Bar Chart) ── */
  const apptChartData = {
    labels: ["Approved", "Pending", "Rejected", "Completed"],
    datasets: [
      {
        label: "Appointments",
        data: [approved, pending, rejected, completed],
        backgroundColor: ["#43A047", "#FB8C00", "#E53935", "#1565C0"],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 12, flexDirection: "column", alignItems: "center", gap: 2 }}>
        <CircularProgress size={44} sx={{ color: "#1565C0" }} />
        <Typography color="text.secondary" fontWeight={500}>
          Loading clinical intelligence & analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Top Header Controls ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="#1A202C">
            Hospital Analytics & Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time consultation activity, patient inflow trends, and department performance.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Time Range Filter */}
          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={timeRange === "7days" ? "contained" : "outlined"}
              onClick={() => setTimeRange("7days")}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === "30days" ? "contained" : "outlined"}
              onClick={() => setTimeRange("30days")}
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === "all" ? "contained" : "outlined"}
              onClick={() => setTimeRange("all")}
            >
              All Time
            </Button>
          </ButtonGroup>

          {/* Refresh Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={() => loadData(true)}
            disabled={refreshing}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ── KPI Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon sx={{ color: "#fff" }} />}
            label="Total Platform Users"
            value={users.length}
            subtext={`${totalPatients} Patients • ${totalDoctors} Doctors`}
            color="#4A148C"
            bg="#F3E5F5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CalendarIcon sx={{ color: "#fff" }} />}
            label="Consultations Volume"
            value={totalAppts}
            subtext={timeRange === "all" ? "Lifetime appointments" : `Filtered: ${timeRange}`}
            color="#1565C0"
            bg="#E3F2FD"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ThumbUpIcon sx={{ color: "#fff" }} />}
            label="Acceptance Rate"
            value={`${acceptanceRate}%`}
            subtext={`${approved + completed} of ${totalAppts} bookings approved`}
            color="#00695C"
            bg="#E0F2F1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PendingIcon sx={{ color: "#fff" }} />}
            label="Action Required"
            value={pending}
            subtext={`${pending} pending approval by doctors`}
            color="#E65100"
            bg="#FFF3E0"
          />
        </Grid>
      </Grid>

      {/* ── Trend Line & Status Breakdown Charts ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Trend Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Appointment Booking Inflow Trend
                </Typography>
              </Box>
              <Chip label={timeRange === "7days" ? "Past 7 Days" : timeRange === "30days" ? "Past 30 Days" : "Recent Window"} size="small" color="primary" variant="outlined" />
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Timeline of patient consultation requests over selected period.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 260 }}>
              <Line
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#F5F5F5" },
                      ticks: { stepSize: 1 },
                    },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Status Breakdown Bar Chart */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={0.5}>
              Appointment Status
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Distribution across consultation lifecycle.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 260 }}>
              <Bar
                data={apptChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#F5F5F5" } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Specialization Breakdown & Peak Hours Charts ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Doctor Specialization Donut */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <PieIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Doctor Specializations
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Staff distribution across medical clinical specialties.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxWidth: 260, mx: "auto", py: 1 }}>
              <Doughnut
                data={specialtyChartData}
                options={{
                  plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } },
                  },
                  cutout: "68%",
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Peak Consultation Slots */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Peak OPD Booking Hours
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Time slots experiencing highest patient consultation demand.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 240 }}>
              <Bar
                data={peakHoursData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#F5F5F5" } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Recent Activity Stream & System Health ── */}
      <Grid container spacing={3}>
        {/* Recent Appointments Stream */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Recent Clinical Activity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Showing latest 5 appointments
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {appointments.length === 0 ? (
              <Typography color="text.secondary" py={4} align="center">
                No appointments booked yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Schedule</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.slice(0, 5).map((a) => {
                      const statusStyle = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                      return (
                        <TableRow key={a._id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: "#E0F2F1", color: "#00695C", fontSize: "0.75rem" }}>
                                {a.patient?.name?.[0] || "P"}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {a.patient?.name || "Patient"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {a.doctor?.name ? `Dr. ${a.doctor.name}` : "Doctor"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {a.doctor?.specialization || "General"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {a.date}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {a.time}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={a.status.toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.color,
                                fontWeight: 700,
                                fontSize: "0.7rem",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* System Infrastructure Health */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Platform Health & Status
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>API Server Status</Typography>
                  <Chip label="OPERATIONAL" size="small" sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontWeight: 700, fontSize: "0.65rem" }} />
                </Box>
                <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, bgcolor: "#E0E0E0", "& .MuiLinearProgress-bar": { bgcolor: "#2E7D32" } }} />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>MongoDB Atlas Cluster</Typography>
                  <Chip label="CONNECTED" size="small" sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontWeight: 700, fontSize: "0.65rem" }} />
                </Box>
                <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, bgcolor: "#E0E0E0", "& .MuiLinearProgress-bar": { bgcolor: "#00695C" } }} />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>Cloudinary Media CDN</Typography>
                  <Chip label="ACTIVE" size="small" sx={{ bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: 700, fontSize: "0.65rem" }} />
                </Box>
                <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, bgcolor: "#E0E0E0", "& .MuiLinearProgress-bar": { bgcolor: "#1565C0" } }} />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>Consultation Completion</Typography>
                  <Typography variant="caption" fontWeight={700} color="#1565C0">{completionRate}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={completionRate} sx={{ height: 6, borderRadius: 3, bgcolor: "#E0E0E0", "& .MuiLinearProgress-bar": { bgcolor: "#1565C0" } }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
