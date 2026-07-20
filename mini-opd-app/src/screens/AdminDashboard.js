import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { getAllUsers, getAllAppointments } from "../services/api";

export default function AdminDashboard({ setRole }) {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    doctors: 0,
    patients: 0,
    totalAppointments: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const [usersRes, apptRes] = await Promise.all([
        getAllUsers(token),
        getAllAppointments(token),
      ]);

      const users = usersRes.data || [];
      const appts = apptRes.data || [];

      setStats({
        totalUsers: users.length,
        doctors: users.filter((u) => u.role === "doctor").length,
        patients: users.filter((u) => u.role === "patient").length,
        totalAppointments: appts.length,
        pending: appts.filter((a) => a.status === "pending").length,
        approved: appts.filter((a) => a.status === "approved").length,
        rejected: appts.filter((a) => a.status === "rejected").length,
        completed: appts.filter((a) => a.status === "completed").length,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          setRole(null);
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4A148C" />

      {/* ── Header Banner ── */}
      <LinearGradient colors={["#4A148C", "#7B1FA2"]} style={styles.banner}>
        <View style={styles.bannerRow}>
          <View>
            <Text style={styles.greetText}>Admin Panel</Text>
            <Text style={styles.nameText}>Mini OPD 🛠️</Text>
            <Text style={styles.bannerSub}>System Overview</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#7B1FA2" />
          <Text style={{ color: "#888", marginTop: 10 }}>Loading stats...</Text>
        </View>
      ) : (
        <>
          {/* ── Users Stats ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Users
            </Text>
            <View style={styles.statsGrid}>
              {[
                { icon: "people",  label: "Total Users",  value: stats.totalUsers, color: "#4A148C", bg: "#EDE7F6" },
                { icon: "medkit",  label: "Doctors",      value: stats.doctors,    color: "#1565C0", bg: "#E3F2FD" },
                { icon: "person",  label: "Patients",     value: stats.patients,   color: "#00695C", bg: "#E0F2F1" },
              ].map((s) => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
                  <View style={[styles.statIcon, { backgroundColor: s.color }]}>
                    <Ionicons name={s.icon} size={20} color="#fff" />
                  </View>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Appointment Stats ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Appointments
            </Text>
            <View style={styles.statsGrid}>
              {[
                { icon: "calendar",          label: "Total",     value: stats.totalAppointments, color: "#37474F", bg: "#ECEFF1" },
                { icon: "time-outline",      label: "Pending",   value: stats.pending,           color: "#E65100", bg: "#FFF3E0" },
                { icon: "checkmark-circle",  label: "Approved",  value: stats.approved,          color: "#2E7D32", bg: "#E8F5E9" },
                { icon: "close-circle",      label: "Rejected",  value: stats.rejected,          color: "#B71C1C", bg: "#FFEBEE" },
              ].map((s) => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
                  <View style={[styles.statIcon, { backgroundColor: s.color }]}>
                    <Ionicons name={s.icon} size={20} color="#fff" />
                  </View>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Refresh Button ── */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => { setLoading(true); loadStats(); }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={20} color="#7B1FA2" />
              <Text style={styles.refreshText}>Refresh Stats</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    paddingTop: 54,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  bannerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetText: { color: "rgba(255,255,255,0.75)", fontSize: 13 },
  nameText: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 2 },
  bannerSub: { color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 4 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  logoutText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  loadingBox: {
    alignItems: "center",
    paddingTop: 60,
  },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 14 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "46%",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: 26, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#555", textAlign: "center" },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#7B1FA2",
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
  },
  refreshText: { color: "#7B1FA2", fontWeight: "bold", fontSize: 15 },
});
