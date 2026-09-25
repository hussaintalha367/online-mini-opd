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
import { NotificationContext } from "../context/NotificationContext";
import { getAppointmentStats } from "../services/api";
import NotificationModal from "../components/NotificationModal";

const quickLinks = [
  { icon: "medkit-outline",                    label: "Find Doctor",  screen: "Doctors",      color: "#1565C0", bg: "#E3F2FD" },
  { icon: "calendar-outline",                  label: "Appointments", screen: "Appointments", color: "#00838F", bg: "#E0F7FA" },
  { icon: "chatbubble-ellipses-outline",        label: "Chat",         screen: "Appointments", color: "#6A1B9A", bg: "#F3E5F5" },
  { icon: "person-outline",                    label: "Profile",      screen: "Profile",      color: "#2E7D32", bg: "#E8F5E9" },
];

const tips = [
  "Drink at least 8 glasses of water daily.",
  "Regular exercise improves heart health.",
  "Sleep 7–8 hours for better immunity.",
  "Wash hands frequently to prevent infections.",
  "Schedule regular health check-ups.",
  "Eat balanced meals with fruits and vegetables.",
  "Avoid smoking and limit alcohol intake.",
];

export default function PatientDashboard({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { appointmentBadge, refreshBadges } = useContext(NotificationContext);

  const [user, setUser]           = useState({ name: "Patient" });
  const [stats, setStats]         = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [tip]                     = useState(tips[Math.floor(Math.random() * tips.length)]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  /* Load user from storage */
  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
  };

  /* Load real stats from backend */
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

  /* Refresh when tab comes back into focus */
  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadStats(true);
      refreshBadges?.();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStats(true);
    refreshBadges?.();
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1565C0"]} />
        }
      >
        <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

        {/* ── Header Banner ── */}
        <LinearGradient colors={["#1565C0", "#0288D1"]} style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.greetText}>{greeting()},</Text>
              <Text style={styles.nameText} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.bannerSub}>How are you feeling today?</Text>
            </View>

            {/* Header Right: Notification Icon + Avatar */}
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => setShowNotifModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={22} color="#fff" />
                {appointmentBadge > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>
                      {appointmentBadge > 9 ? "9+" : appointmentBadge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Profile")}
                activeOpacity={0.85}
              >
                {user.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Ionicons name="person" size={24} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Health tip chip */}
          <View style={styles.tipChip}>
            <Ionicons name="bulb-outline" size={14} color="#FFD54F" />
            <Text style={styles.tipText} numberOfLines={2}>{tip}</Text>
          </View>
        </LinearGradient>

      {/* ── Quick Actions ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickLinks.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.quickCard, { backgroundColor: item.bg }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={22} color="#fff" />
              </View>
              <Text style={[styles.quickLabel, { color: item.color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Health Summary (Real Stats) ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Health Summary</Text>

        {loadingStats ? (
          <View style={styles.statsLoader}>
            <ActivityIndicator color="#1565C0" />
            <Text style={styles.statsLoaderText}>Loading stats…</Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: "#E3F2FD" }]}
              onPress={() => navigation.navigate("Appointments")}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar" size={26} color="#1565C0" />
              <Text style={[styles.infoValue, { color: "#1565C0" }]}>
                {stats ? (stats.approved + stats.pending) : "—"}
              </Text>
              <Text style={styles.infoLabel}>Upcoming{"\n"}Appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: "#E8F5E9" }]}
              onPress={() => navigation.navigate("Appointments")}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={26} color="#2E7D32" />
              <Text style={[styles.infoValue, { color: "#2E7D32" }]}>
                {stats ? stats.completed : "—"}
              </Text>
              <Text style={styles.infoLabel}>Completed{"\n"}Visits</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: "#FFF3E0" }]}
              onPress={() => navigation.navigate("Appointments")}
              activeOpacity={0.85}
            >
              <Ionicons name="document-text" size={26} color="#E65100" />
              <Text style={[styles.infoValue, { color: "#E65100" }]}>
                {stats ? stats.total : "—"}
              </Text>
              <Text style={styles.infoLabel}>Total{"\n"}Appointments</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Status Breakdown ── */}
      {stats && stats.total > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Status Overview</Text>
          <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
            {[
              { label: "Pending",   value: stats.pending,   color: "#E65100", bg: "#FFF3E0"  },
              { label: "Approved",  value: stats.approved,  color: "#2E7D32", bg: "#E8F5E9"  },
              { label: "Completed", value: stats.completed, color: "#1565C0", bg: "#E3F2FD"  },
              { label: "Cancelled", value: stats.cancelled, color: "#757575", bg: "#F5F5F5"  },
            ].map((s) => (
              <View key={s.label} style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: s.color }]} />
                <Text style={[styles.statusLabel, { color: theme.text }]}>{s.label}</Text>
                <View style={[styles.statusBar, { backgroundColor: "#F0F0F0", flex: 1, marginHorizontal: 10 }]}>
                  <View
                    style={[
                      styles.statusBarFill,
                      {
                        backgroundColor: s.color,
                        width: `${stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.statusValue, { color: s.color }]}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── CTA Banner ── */}
      <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Doctors")}
        >
          <LinearGradient
            colors={["#00838F", "#26A69A"]}
            style={styles.ctaBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Need a Doctor?</Text>
              <Text style={styles.ctaSub}>Browse and book an appointment now</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={36} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>

    {/* ── Notification Center Sheet Modal ── */}
    <NotificationModal
      visible={showNotifModal}
      onClose={() => setShowNotifModal(false)}
      navigation={navigation}
      role="patient"
    />
  </>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  notifBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#1565C0",
  },
  notifBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.6)",
  },
  avatarFallback: {
    width: 52, height: 52, borderRadius: 26,
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

  /* Quick Grid */
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickCard: {
    width: "46%", borderRadius: 18, padding: 16,
    alignItems: "center", gap: 10,
  },
  quickIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
  },
  quickLabel: { fontSize: 13, fontWeight: "600" },

  /* Stats loader */
  statsLoader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 16, justifyContent: "center",
  },
  statsLoaderText: { color: "#888", fontSize: 13 },

  /* Info Row */
  infoRow:  { flexDirection: "row", gap: 10 },
  infoCard: {
    flex: 1, borderRadius: 16, padding: 14,
    alignItems: "center", gap: 6,
  },
  infoValue: { fontSize: 20, fontWeight: "bold" },
  infoLabel: { fontSize: 11, color: "#555", textAlign: "center" },

  /* Status card */
  statusCard: {
    borderRadius: 18, padding: 16, gap: 12,
    elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  statusRow:   { flexDirection: "row", alignItems: "center" },
  statusDot:   { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusLabel: { fontSize: 13, fontWeight: "500", width: 70 },
  statusBar:   { height: 6, borderRadius: 4, overflow: "hidden" },
  statusBarFill: { height: "100%", borderRadius: 4 },
  statusValue: { fontSize: 13, fontWeight: "bold", width: 24, textAlign: "right" },

  /* CTA */
  ctaBanner: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 20, padding: 20,
  },
  ctaTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  ctaSub:   { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
});
