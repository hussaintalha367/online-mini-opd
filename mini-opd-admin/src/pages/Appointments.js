import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Card,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Avatar,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { getAllAppointments } from "../services/api";
import { exportToCSV, printReport } from "../utils/exportUtils";

const STATUS_CONFIG = {
  pending:   { color: "#E65100", bg: "#FFF3E0" },
  approved:  { color: "#2E7D32", bg: "#E8F5E9" },
  rejected:  { color: "#B71C1C", bg: "#FFEBEE" },
  completed: { color: "#1565C0", bg: "#E3F2FD" },
  cancelled: { color: "#555",    bg: "#ECEFF1" },
};

const STATUS_TABS = ["all", "pending", "approved", "rejected", "completed"];

export default function Appointments({ token }) {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const applyFilters = useCallback((text, status, list = appointments) => {
    let res = list;
    if (status !== "all") {
      res = res.filter((a) => a.status === status);
    }
    if (text.trim()) {
      res = res.filter(
        (a) =>
          a.doctor?.name?.toLowerCase().includes(text.toLowerCase()) ||
          a.patient?.name?.toLowerCase().includes(text.toLowerCase())
      );
    }
    setFiltered(res);
  }, [appointments]);

  const load = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await getAllAppointments(token);
      const data = res.data || [];
      setAppointments(data);
      applyFilters(search, statusFilter, data);
    } catch (e) {
      console.error(e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [token, search, statusFilter, applyFilters]);

  useEffect(() => {
    load();
    // Auto-refresh appointments every 8 seconds
    const interval = setInterval(() => {
      load(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    applyFilters(e.target.value, statusFilter);
  };

  const handleStatusFilter = (_, val) => {
    if (!val) return;
    setStatusFilter(val);
    applyFilters(search, val);
  };

  const handleExportCSV = () => {
    const data = filtered.map((item, idx) => ({
      "#": idx + 1,
      "Appointment ID": item._id,
      "Doctor": item.doctor?.name ? `Dr. ${item.doctor.name}` : "N/A",
      "Specialization": item.doctor?.specialization || "General",
      "Patient": item.patient?.name || "N/A",
      "Patient Email": item.patient?.email || "N/A",
      "Date": item.date || "N/A",
      "Time": item.time || "N/A",
      "Status": item.status ? item.status.toUpperCase() : "PENDING",
      "Prescription": item.prescription ? "Available" : "None",
      "Created At": item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
    }));
    exportToCSV(`MiniOPD_Appointments_${statusFilter}`, data);
  };

  const handlePrint = () => {
    printReport({
      title: "Appointments Schedule & Report",
      subtitle: `Status: ${statusFilter.toUpperCase()} (${filtered.length} records)`,
      columns: ["#", "Doctor", "Specialization", "Patient", "Date", "Time", "Status"],
      rows: filtered.map((item, idx) => [
        idx + 1,
        item.doctor?.name ? `Dr. ${item.doctor.name}` : "—",
        item.doctor?.specialization || "General",
        item.patient?.name || "—",
        item.date || "—",
        item.time || "—",
        item.status ? item.status.toUpperCase() : "PENDING",
      ]),
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Appointments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {appointments.length} total appointments in the system
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={filtered.length === 0}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Print / PDF
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#1565C0" }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Filters Row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={handleStatusFilter}
          size="small"
          sx={{ flexWrap: "wrap", gap: 0.5 }}
        >
          {STATUS_TABS.map((s) => {
            const cfg = STATUS_CONFIG[s] || {};
            return (
              <ToggleButton
                key={s}
                value={s}
                sx={{
                  borderRadius: "20px !important",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 12,
                  px: 2,
                  border: "1px solid #E8ECF4 !important",
                  "&.Mui-selected": {
                    bgcolor: cfg.bg || "#E3F2FD",
                    color: cfg.color || "#1565C0",
                    borderColor: `${cfg.color}44 !important`,
                  },
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                <Chip
                  label={
                    s === "all"
                      ? appointments.length
                      : appointments.filter((a) => a.status === s).length
                  }
                  size="small"
                  sx={{ ml: 0.8, height: 18, fontSize: 11, "& .MuiChip-label": { px: 0.8 } }}
                />
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder="Search by doctor or patient..."
          value={search}
          onChange={handleSearch}
          sx={{ width: 280, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 8, flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress />
          <Typography color="text.secondary">Loading appointments...</Typography>
        </Box>
      ) : (
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F7F8FA" }}>
                  {["#", "Doctor", "Patient", "Date", "Time", "Status"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "text.secondary", fontSize: 13 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>
                      No appointments found
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((item, idx) => {
                  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                  return (
                    <TableRow
                      key={item._id}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      {/* # */}
                      <TableCell>
                        <Typography variant="body2" color="text.disabled" fontWeight={600}>
                          {idx + 1}
                        </Typography>
                      </TableCell>

                      {/* Doctor */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#1565C0", fontSize: 13 }}>
                            {item.doctor?.name?.charAt(0).toUpperCase() || "D"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {item.doctor?.name ? `Dr. ${item.doctor.name}` : "—"}
                            </Typography>
                            {item.doctor?.specialization && (
                              <Typography variant="caption" color="text.secondary">
                                {item.doctor.specialization}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Patient */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#00695C", fontSize: 13 }}>
                            {item.patient?.name?.charAt(0).toUpperCase() || "P"}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {item.patient?.name || "—"}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography variant="body2">{item.date || "—"}</Typography>
                      </TableCell>

                      {/* Time */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.time || "—"}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: cfg.bg,
                            color: cfg.color,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
