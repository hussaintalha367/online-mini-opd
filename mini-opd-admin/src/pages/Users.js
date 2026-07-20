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
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
} from "@mui/material";
import {
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { getAllUsers, toggleBlockUser } from "../services/api";

const ROLE_COLORS = {
  doctor:  { color: "#1565C0", bg: "#E3F2FD" },
  patient: { color: "#00695C", bg: "#E0F2F1" },
  admin:   { color: "#4A148C", bg: "#F3E5F5" },
};

export default function Users({ token }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [blockingId, setBlockingId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const res = await getAllUsers(token);
      setUsers(res.data || []);
      setFiltered(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(val.toLowerCase()) ||
          u.email.toLowerCase().includes(val.toLowerCase()) ||
          u.role.toLowerCase().includes(val.toLowerCase())
      )
    );
  };

  const handleBlock = async (id) => {
    setBlockingId(id);
    try {
      await toggleBlockUser(token, id);
      await loadUsers();
    } finally {
      setBlockingId(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {users.length} total users registered
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search by name, email, role..."
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
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((user) => {
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
                                onClick={() => handleBlock(user._id)}
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
