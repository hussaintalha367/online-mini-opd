import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Search as SearchIcon,
  VerifiedUser as VerifiedIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  HourglassEmpty as PendingIcon,
  MedicalServices as MedicalIcon,
  Badge as BadgeIcon,
  FileDownload as ExportIcon,
} from "@mui/icons-material";
import { getAllUsers, verifyDoctor, updateDoctorCredentials } from "../services/api";
import { exportToCSV } from "../utils/exportUtils";

const STATUS_CONFIG = {
  approved: {
    color: "#2E7D32",
    bg: "#E8F5E9",
    label: "Approved & Verified",
    icon: <VerifiedIcon fontSize="small" sx={{ color: "#2E7D32", mr: 0.5 }} />,
  },
  pending: {
    color: "#ED6C02",
    bg: "#FFF3E0",
    label: "Pending Review",
    icon: <PendingIcon fontSize="small" sx={{ color: "#ED6C02", mr: 0.5 }} />,
  },
  rejected: {
    color: "#D32F2F",
    bg: "#FFEBEE",
    label: "Rejected / Suspended",
    icon: <RejectIcon fontSize="small" sx={{ color: "#D32F2F", mr: 0.5 }} />,
  },
};

export default function DoctorVerification({ token }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit / Audit modal state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    medicalLicenseNumber: "",
    qualification: "",
    specialization: "",
    experience: 0,
    consultationFee: 1500,
    verificationStatus: "approved",
    verificationNotes: "",
  });
  const [savingCredentials, setSavingCredentials] = useState(false);

  // Quick action processing IDs
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Toast notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const loadDoctors = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await getAllUsers(token);
      const allUsers = res.data || [];
      const docList = allUsers.filter((u) => u.role === "doctor");
      setDoctors(docList);
    } catch (e) {
      console.error("Failed to load doctors:", e);
      if (!isBackground) {
        setSnackbar({ open: true, message: "Error loading doctor registry", severity: "error" });
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDoctors();
    // Auto-refresh doctor verification registry every 8 seconds
    const interval = setInterval(() => {
      loadDoctors(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [loadDoctors]);

  // Statistics
  const stats = useMemo(() => {
    const total = doctors.length;
    const approved = doctors.filter((d) => (d.verificationStatus || (d.isVerified ? "approved" : "pending")) === "approved").length;
    const pending = doctors.filter((d) => (d.verificationStatus || (!d.isVerified ? "pending" : "approved")) === "pending").length;
    const rejected = doctors.filter((d) => d.verificationStatus === "rejected").length;
    return { total, approved, pending, rejected };
  }, [doctors]);

  // Filtered list
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const currentStatus = doc.verificationStatus || (doc.isVerified ? "approved" : "pending");
      if (statusFilter !== "all" && currentStatus !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = doc.name?.toLowerCase().includes(q);
        const matchesEmail = doc.email?.toLowerCase().includes(q);
        const matchesSpec = doc.specialization?.toLowerCase().includes(q);
        const matchesLic = doc.medicalLicenseNumber?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSpec && !matchesLic) return false;
      }
      return true;
    });
  }, [doctors, statusFilter, search]);

  // Quick 1-click status change
  const handleQuickStatusChange = async (docId, newStatus) => {
    setActionLoadingId(docId);
    try {
      await verifyDoctor(token, docId, {
        status: newStatus,
        notes: newStatus === "approved" ? "Approved by Admin" : "Flagged/Suspended by Admin",
      });
      setSnackbar({
        open: true,
        message: `Doctor status updated to ${newStatus.toUpperCase()}!`,
        severity: newStatus === "approved" ? "success" : "warning",
      });
      await loadDoctors();
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "Failed to update doctor status", severity: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open edit credentials dialog
  const handleOpenEdit = (doc) => {
    setSelectedDoctor(doc);
    setEditForm({
      medicalLicenseNumber: doc.medicalLicenseNumber || "",
      qualification: doc.qualification || "MBBS",
      specialization: doc.specialization || "General Physician",
      experience: doc.experience || 0,
      consultationFee: doc.consultationFee !== undefined ? doc.consultationFee : 1500,
      verificationStatus: doc.verificationStatus || (doc.isVerified ? "approved" : "pending"),
      verificationNotes: doc.verificationNotes || "",
    });
    setEditDialogOpen(true);
  };

  // Save edited credentials
  const handleSaveCredentials = async () => {
    if (!selectedDoctor) return;
    setSavingCredentials(true);
    try {
      await updateDoctorCredentials(token, selectedDoctor._id, editForm);
      setSnackbar({ open: true, message: "Doctor credentials saved successfully!", severity: "success" });
      setEditDialogOpen(false);
      await loadDoctors();
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "Failed to save doctor credentials", severity: "error" });
    } finally {
      setSavingCredentials(false);
    }
  };

  // Export doctor roster to CSV
  const handleExportCSV = () => {
    const data = filteredDoctors.map((doc, idx) => {
      const currentStatus = doc.verificationStatus || (doc.isVerified ? "approved" : "pending");
      return {
        "#": idx + 1,
        "Doctor Name": `Dr. ${doc.name}`,
        "Email": doc.email,
        "Phone": doc.phone || "N/A",
        "License Number": doc.medicalLicenseNumber || "Not Registered",
        "Qualification": doc.qualification || "MBBS",
        "Specialization": doc.specialization || "General Physician",
        "Experience (Yrs)": doc.experience || 0,
        "Consultation Fee (PKR)": doc.consultationFee || 1500,
        "Verification Status": currentStatus.toUpperCase(),
        "Audit Notes": doc.verificationNotes || "None",
      };
    });
    exportToCSV(`MiniOPD_Doctors_Verification_${statusFilter}`, data);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              Doctor Credential & Verification
            </Typography>
            <VerifiedIcon color="primary" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Verify medical licenses, credential qualifications, and manage doctor practice status
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<ExportIcon />}
          onClick={handleExportCSV}
          disabled={filteredDoctors.length === 0}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#1565C0" }}
        >
          Export Doctor Roster (CSV)
        </Button>
      </Box>

      {/* KPI Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #E8ECF4", bgcolor: "#fff" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TOTAL DOCTORS
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1565C0">
                  {stats.total}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#E3F2FD", color: "#1565C0", width: 44, height: 44 }}>
                <MedicalIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #E8ECF4", bgcolor: "#fff" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  VERIFIED & APPROVED
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#2E7D32">
                  {stats.approved}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", width: 44, height: 44 }}>
                <VerifiedIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #E8ECF4", bgcolor: "#fff" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  PENDING REVIEW
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#ED6C02">
                  {stats.pending}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#FFF3E0", color: "#ED6C02", width: 44, height: 44 }}>
                <PendingIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #E8ECF4", bgcolor: "#fff" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  REJECTED / SUSPENDED
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#D32F2F">
                  {stats.rejected}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#FFEBEE", color: "#D32F2F", width: 44, height: 44 }}>
                <RejectIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs and Search Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, val) => val && setStatusFilter(val)}
          size="small"
          sx={{ flexWrap: "wrap", gap: 0.5 }}
        >
          {[
            { id: "all", label: "All Doctors", count: stats.total },
            { id: "approved", label: "Approved & Verified", count: stats.approved },
            { id: "pending", label: "Pending Review", count: stats.pending },
            { id: "rejected", label: "Rejected", count: stats.rejected },
          ].map((tab) => (
            <ToggleButton
              key={tab.id}
              value={tab.id}
              sx={{
                borderRadius: "20px !important",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 12,
                px: 2,
                border: "1px solid #E8ECF4 !important",
                "&.Mui-selected": {
                  bgcolor: tab.id === "approved" ? "#E8F5E9" : tab.id === "pending" ? "#FFF3E0" : tab.id === "rejected" ? "#FFEBEE" : "#E3F2FD",
                  color: tab.id === "approved" ? "#2E7D32" : tab.id === "pending" ? "#ED6C02" : tab.id === "rejected" ? "#D32F2F" : "#1565C0",
                  borderColor: "transparent !important",
                },
              }}
            >
              {tab.label}
              <Chip
                label={tab.count}
                size="small"
                sx={{ ml: 0.8, height: 18, fontSize: 11, "& .MuiChip-label": { px: 0.8 } }}
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder="Search by name, license #, specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Main Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 8, flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress />
          <Typography color="text.secondary">Loading doctor credential registry...</Typography>
        </Box>
      ) : (
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F7F8FA" }}>
                  {["Doctor", "Medical License", "Specialization & Qualification", "Experience & Fee", "Verification Status", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "text.secondary", fontSize: 13 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDoctors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>
                      No doctor records found
                    </TableCell>
                  </TableRow>
                )}
                {filteredDoctors.map((doc) => {
                  const currentStatus = doc.verificationStatus || (doc.isVerified ? "approved" : "pending");
                  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
                  const isLoadingThis = actionLoadingId === doc._id;

                  return (
                    <TableRow key={doc._id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                      {/* Doctor Profile */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={doc.profileImage || ""}
                            sx={{ width: 40, height: 40, bgcolor: "#1565C0", fontSize: 15, fontWeight: 700 }}
                          >
                            {doc.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                              <Typography variant="body2" fontWeight={700}>
                                Dr. {doc.name}
                              </Typography>
                              {currentStatus === "approved" && (
                                <Tooltip title="Verified Practitioner">
                                  <VerifiedIcon sx={{ fontSize: 16, color: "#1976D2" }} />
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {doc.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* License Number */}
                      <TableCell>
                        {doc.medicalLicenseNumber ? (
                          <Chip
                            icon={<BadgeIcon sx={{ fontSize: "14px !important" }} />}
                            label={doc.medicalLicenseNumber}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: 11, borderColor: "#B0BEC5" }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled" fontStyle="italic">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>

                      {/* Specialization & Qualification */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {doc.specialization || "General Medicine"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.qualification || "MBBS"}
                        </Typography>
                      </TableCell>

                      {/* Experience & Fee */}
                      <TableCell>
                        <Typography variant="body2">
                          {doc.experience || 0} years exp.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                          Rs. {doc.consultationFee !== undefined ? doc.consultationFee : 1500} / visit
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          icon={cfg.icon}
                          label={cfg.label}
                          size="small"
                          sx={{
                            bgcolor: cfg.bg,
                            color: cfg.color,
                            fontWeight: 700,
                            fontSize: 12,
                            pl: 0.5,
                          }}
                        />
                        {doc.verificationNotes && (
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, maxWidth: 160 }}>
                            {doc.verificationNotes}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {currentStatus !== "approved" && (
                            <Tooltip title="Approve & Verify Doctor">
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleQuickStatusChange(doc._id, "approved")}
                                  disabled={isLoadingThis}
                                  sx={{ bgcolor: "#E8F5E9" }}
                                >
                                  {isLoadingThis ? <CircularProgress size={16} /> : <ApproveIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {currentStatus !== "rejected" && (
                            <Tooltip title="Reject / Flag Account">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleQuickStatusChange(doc._id, "rejected")}
                                  disabled={isLoadingThis}
                                  sx={{ bgcolor: "#FFEBEE" }}
                                >
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          <Tooltip title="Edit Credentials & License">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEdit(doc)}
                              sx={{ bgcolor: "#E3F2FD" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Edit Doctor Credentials Modal Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <MedicalIcon color="primary" />
          Edit Doctor Credentials & Licensing
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {selectedDoctor && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Dr. {selectedDoctor.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedDoctor.email} &bull; Registered {selectedDoctor.createdAt ? new Date(selectedDoctor.createdAt).toLocaleDateString() : ""}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medical License # (PMDC / Council)"
                placeholder="e.g. PMDC-18294-M"
                size="small"
                value={editForm.medicalLicenseNumber}
                onChange={(e) => setEditForm({ ...editForm, medicalLicenseNumber: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medical Qualifications"
                placeholder="e.g. MBBS, FCPS (Cardiology)"
                size="small"
                value={editForm.qualification}
                onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Specialization"
                placeholder="e.g. Cardiologist, Dermatologist"
                size="small"
                value={editForm.specialization}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience (Years)"
                type="number"
                size="small"
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Fee (PKR)"
                type="number"
                size="small"
                value={editForm.consultationFee}
                onChange={(e) => setEditForm({ ...editForm, consultationFee: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Verification Status"
                size="small"
                value={editForm.verificationStatus}
                onChange={(e) => setEditForm({ ...editForm, verificationStatus: e.target.value })}
              >
                <MenuItem value="approved">Approved & Verified</MenuItem>
                <MenuItem value="pending">Pending Review</MenuItem>
                <MenuItem value="rejected">Rejected / Suspended</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Admin Verification Audit Notes"
                placeholder="e.g., Medical license cross-verified with registry on 2026-09-26"
                size="small"
                value={editForm.verificationNotes}
                onChange={(e) => setEditForm({ ...editForm, verificationNotes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ textTransform: "none", color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCredentials}
            disabled={savingCredentials}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, bgcolor: "#1565C0" }}
          >
            {savingCredentials ? <CircularProgress size={20} color="inherit" /> : "Save Credentials"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
