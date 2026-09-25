import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { getAllUsers, toggleBlockUser } from "../services/api";
import { exportToCSV, printReport } from "../utils/exportUtils";

const ROLE_COLORS = {
  doctor:  { color: "#1565C0", bg: "#E3F2FD" },
  patient: { color: "#00695C", bg: "#E0F2F1" },
  admin:   { color: "#4A148C", bg: "#F3E5F5" },
};

export default function Users({ token }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [blockingId, setBlockingId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const res = await getAllUsers(token);
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role / status filter
      if (roleFilter === "doctor" && u.role !== "doctor") return false;
      if (roleFilter === "patient" && u.role !== "patient") return false;
      if (roleFilter === "blocked" && !u.isBlocked) return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesRole = u.role?.toLowerCase().includes(q);
        const matchesSpec = u.specialization?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole && !matchesSpec) {
          return false;
        }
      }
      return true;
    });
  }, [users, roleFilter, search]);

  const handleExportCSV = () => {
    const data = filteredUsers.map((u, idx) => ({
      "#": idx + 1,
      "Name": u.name || "",
      "Email": u.email || "",
      "Role": u.role ? u.role.toUpperCase() : "",
      "Specialization": u.specialization || "N/A",
      "Experience (Years)": u.experience || "N/A",
      "Phone": u.phone || "N/A",
      "Status": u.isBlocked ? "Blocked" : "Active",
      "Registered On": u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
    }));
    exportToCSV(`MiniOPD_Users_${roleFilter}`, data);
  };

  const handlePrint = () => {
    printReport({
      title: "User Directory & Roster",
      subtitle: `Filter: ${roleFilter.toUpperCase()} (${filteredUsers.length} records)`,
      columns: ["#", "Name", "Email", "Role", "Specialization", "Phone", "Status"],
      rows: filteredUsers.map((u, idx) => [
        idx + 1,
        u.name || "—",
        u.email || "—",
        u.role ? u.role.toUpperCase() : "—",
        u.specialization || "—",
        u.phone || "—",
        u.isBlocked ? "BLOCKED" : "ACTIVE",
      ]),
    });
  };

  const handleToggleBlock = async (user) => {
    setBlockingId(user._id);
    try {
      await toggleBlockUser(token, user._id, user.isBlocked);
      await loadUsers();
    } catch (e) {
      console.error("Toggle block error:", e);
    } finally {
      setBlockingId(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {users.length} total registered accounts across all roles
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={filteredUsers.length === 0}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Print / PDF
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
            disabled={filteredUsers.length === 0}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#1565C0" }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <ToggleButtonGroup
          value={roleFilter}
          exclusive
          onChange={(_, val) => val && setRoleFilter(val)}
          size="small"
          sx={{ flexWrap: "wrap", gap: 0.5 }}
        >
          {[
            { id: "all", label: "All Users", count: users.length },
            { id: "doctor", label: "Doctors", count: users.filter((u) => u.role === "doctor").length },
            { id: "patient", label: "Patients", count: users.filter((u) => u.role === "patient").length },
            { id: "blocked", label: "Blocked", count: users.filter((u) => u.isBlocked).length },
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
                  bgcolor: "#E3F2FD",
                  color: "#1565C0",
                  borderColor: "#1565C044 !important",
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
          placeholder="Search by name, email, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          <Typography color="text.secondary">Loading users...</Typography>
        </Box>
      ) : (
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E8ECF4", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F7F8FA" }}>
                  {["User", "Email", "Role", "Specialization", "Status", "Action"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "text.secondary", fontSize: 13 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}
                {filteredUsers.map((user) => {
                  const roleStyle = ROLE_COLORS[user.role] || {};
                  return (
                    <TableRow
                      key={user._id}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      {/* User */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={user.profileImage || ""}
                            sx={{ width: 36, height: 36, bgcolor: roleStyle.color, fontSize: 14 }}
                          >
                            {user.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: roleStyle.bg,
                            color: roleStyle.color,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        />
                      </TableCell>

                      {/* Specialization */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.specialization || "—"}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={user.isBlocked ? "Blocked" : "Active"}
                          size="small"
                          sx={{
                            bgcolor: user.isBlocked ? "#FFEBEE" : "#E8F5E9",
                            color: user.isBlocked ? "#B71C1C" : "#2E7D32",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        />
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        {user.role !== "admin" && (
                          <Tooltip title={user.isBlocked ? "Unblock User" : "Block User"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleBlock(user)}
                                disabled={blockingId === user._id}
                                color={user.isBlocked ? "success" : "error"}
                              >
                                {blockingId === user._id ? (
                                  <CircularProgress size={16} />
                                ) : user.isBlocked ? (
                                  <UnblockIcon fontSize="small" />
                                ) : (
                                  <BlockIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
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
