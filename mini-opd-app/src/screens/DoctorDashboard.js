import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

const tips = [
  "Check all pending appointments regularly.",
  "Upload prescriptions promptly after consultations.",
  "Keep your profile and specialization up to date.",
  "Respond to patient messages in a timely manner.",
];

export default function DoctorDashboard({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState({ name: "Doctor" });
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
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
    >
      <StatusBar barStyle="light-content" backgroundColor="#00695C" />

      {/* ── Header Banner ── */}
      <LinearGradient colors={["#00695C", "#00897B"]} style={styles.banner}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetText}>{greeting()},</Text>
            <Text style={styles.nameText} numberOfLines={1}>
              Dr. {user.name} 👨‍⚕️
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
            <Text style={styles.actionSub}>View & manage all</Text>
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
            <Text style={styles.actionSub}>Update info & photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats Row ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
        <View style={styles.statsRow}>
          {[
            { icon: "people",          label: "Total Patients",  color: "#1565C0", bg: "#E3F2FD" },
            { icon: "checkmark-circle", label: "Completed",      color: "#2E7D32", bg: "#E8F5E9" },
            { icon: "time",            label: "Pending",         color: "#E65100", bg: "#FFF3E0" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon} size={24} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>—</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

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
              <Text style={styles.ctaTitle}>Pending Appointments</Text>
              <Text style={styles.ctaSub}>Review and approve patient requests</Text>
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
  greetText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  nameText: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 2 },
  bannerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
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
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 14 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1, borderRadius: 18, padding: 16, alignItems: "center", gap: 8,
  },
  actionIcon: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  actionLabel: { fontWeight: "bold", fontSize: 14, textAlign: "center" },
  actionSub: { fontSize: 11, color: "#777", textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, borderRadius: 16, padding: 14,
    alignItems: "center", gap: 6,
  },
  statValue: { fontSize: 20, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: "#555", textAlign: "center" },
  ctaBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 20,
  },
  ctaTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  ctaSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
});
