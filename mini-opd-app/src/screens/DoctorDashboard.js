import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { getAppointmentStats } from "../services/api";

const tips = [
  "Check all pending appointments regularly.",
  "Upload prescriptions promptly after consultations.",
  "Keep your profile and specialization up to date.",
  "Respond to patient messages in a timely manner.",
  "Maintain clear and detailed consultation notes.",
];

export default function DoctorDashboard({ navigation }) {
  const { theme } = useContext(ThemeContext);

  const [user, setUser]               = useState({ name: "Doctor" });
  const [stats, setStats]             = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [tip]                         = useState(tips[Math.floor(Math.random() * tips.length)]);

  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
  };

  const loadStats = async (silent = false) => {
    if (!silent) setLoadingStats(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res   = await getAppointmentStats(token);
      setStats(res.data);
    } catch (_) {
      setStats(null);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  /* Refresh on tab focus */
  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadStats(true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStats(true);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00695C"]} />
      }
    >
      <StatusBar barStyle="light-content" backgroundColor="#00695C" />

      {/* ── Header Banner ── */}
      <LinearGradient colors={["#00695C", "#00897B"]} style={styles.banner}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetText}>{greeting()},</Text>
            <Text style={styles.nameText} numberOfLines={1}>
              Dr. {user.name}
            </Text>
            <Text style={styles.bannerSub}>
              {user.specialization || "Medical Professional"}
            </Text>
          </View>

          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={28} color="#fff" />
            </View>
          )}
        </View>

        {/* Tip chip */}
        <View style={styles.tipChip}>
          <Ionicons name="information-circle-outline" size={14} color="#B2DFDB" />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      </LinearGradient>

      {/* ── Stats Row (Real Data) ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>

        {loadingStats ? (
          <View style={styles.statsLoader}>
            <ActivityIndicator color="#00695C" />
            <Text style={styles.statsLoaderText}>Loading stats…</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {[
              {
                icon: "people",
                label: "Total Patients",
                value: stats ? stats.total : 0,
                color: "#1565C0",
                bg: "#E3F2FD",
              },
              {
                icon: "time-outline",
                label: "Pending",
                value: stats ? stats.pending : 0,
                color: "#E65100",
                bg: "#FFF3E0",
              },
              {
                icon: "checkmark-circle",
                label: "Approved",
                value: stats ? stats.approved : 0,
                color: "#2E7D32",
                bg: "#E8F5E9",
              },
              {
                icon: "checkmark-done-circle",
                label: "Completed",
                value: stats ? stats.completed : 0,
                color: "#00695C",
                bg: "#E0F2F1",
              },
            ].map((s) => (
              <TouchableOpacity
                key={s.label}
                style={[styles.statCard, { backgroundColor: s.bg }]}
                onPress={() => navigation.navigate("Appointments")}
                activeOpacity={0.8}
              >
                <View style={[styles.statIcon, { backgroundColor: s.color }]}>
                  <Ionicons name={s.icon} size={20} color="#fff" />
                </View>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: "#E0F2F1" }]}
            onPress={() => navigation.navigate("Appointments")}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#00695C" }]}>
              <Ionicons name="calendar" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionLabel, { color: "#00695C" }]}>
              My Appointments
            </Text>
            <Text style={styles.actionSub}>View &amp; manage all</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: "#EDE7F6" }]}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#4527A0" }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionLabel, { color: "#4527A0" }]}>
              My Profile
            </Text>
            <Text style={styles.actionSub}>Update info &amp; photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Pending Alert Banner ── */}
      {stats && stats.pending > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Appointments")}
          >
            <LinearGradient
              colors={["#E65100", "#F4511E"]}
              style={styles.alertBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.alertIconBox}>
                <Ionicons name="alert-circle" size={28} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.alertTitle}>
                  {stats.pending} Pending {stats.pending === 1 ? "Request" : "Requests"}
                </Text>
                <Text style={styles.alertSub}>Tap to review and respond</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* ── CTA ── */}
      <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Appointments")}
        >
          <LinearGradient
            colors={["#1565C0", "#0288D1"]}
            style={styles.ctaBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>All Appointments</Text>
              <Text style={styles.ctaSub}>View and manage patient requests</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={36} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Banner */
  banner: {
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  greetText:  { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  nameText:   { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 2 },
  bannerSub:  { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.6)",
  },
  avatarFallback: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.4)",
  },
  tipChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  tipText: { color: "#fff", fontSize: 12, flex: 1 },

  /* Sections */
  section:      { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 14 },

  /* Stats loader */
  statsLoader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 16, justifyContent: "center",
  },
  statsLoaderText: { color: "#888", fontSize: 13 },

  /* Stats Grid */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "46%",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: "#555", textAlign: "center" },

  /* Action cards */
  actionRow: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1, borderRadius: 18, padding: 16, alignItems: "center", gap: 8,
  },
  actionIcon: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  actionLabel: { fontWeight: "bold", fontSize: 14, textAlign: "center" },
  actionSub:   { fontSize: 11, color: "#777", textAlign: "center" },

  /* Alert Banner */
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
  },
  alertIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  alertTitle: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  alertSub:   { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },

  /* CTA */
  ctaBanner: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 20, padding: 20,
  },
  ctaTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  ctaSub:   { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
});
