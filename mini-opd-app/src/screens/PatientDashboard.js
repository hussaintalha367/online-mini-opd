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

const quickLinks = [
  { icon: "medkit-outline",   label: "Find Doctor",    screen: "Doctors",      color: "#1565C0", bg: "#E3F2FD" },
  { icon: "calendar-outline", label: "Appointments",   screen: "Appointments", color: "#00838F", bg: "#E0F7FA" },
  { icon: "chatbubble-ellipses-outline", label: "Chat", screen: "Appointments", color: "#6A1B9A", bg: "#F3E5F5" },
  { icon: "person-outline",   label: "Profile",        screen: "Profile",      color: "#2E7D32", bg: "#E8F5E9" },
];

const tips = [
  "Drink at least 8 glasses of water daily.",
  "Regular exercise improves heart health.",
  "Sleep 7–8 hours for better immunity.",
  "Wash hands frequently to prevent infections.",
  "Schedule regular health check-ups.",
];

export default function PatientDashboard({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState({ name: "Patient" });
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
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* ── Header Banner ── */}
      <LinearGradient colors={["#1565C0", "#0288D1"]} style={styles.banner}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetText}>{greeting()},</Text>
            <Text style={styles.nameText} numberOfLines={1}>
              {user.name} 👋
            </Text>
            <Text style={styles.bannerSub}>How are you feeling today?</Text>
          </View>

          {/* Avatar */}
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={28} color="#fff" />
            </View>
          )}
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

      {/* ── Info Cards ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Health Summary</Text>

        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="calendar" size={26} color="#1565C0" />
            <Text style={[styles.infoValue, { color: "#1565C0" }]}>—</Text>
            <Text style={styles.infoLabel}>Upcoming{"\n"}Appointments</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="checkmark-circle" size={26} color="#2E7D32" />
            <Text style={[styles.infoValue, { color: "#2E7D32" }]}>—</Text>
            <Text style={styles.infoLabel}>Completed{"\n"}Visits</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="document-text" size={26} color="#E65100" />
            <Text style={[styles.infoValue, { color: "#E65100" }]}>—</Text>
            <Text style={styles.infoLabel}>Prescriptions{"\n"}Received</Text>
          </View>
        </View>
      </View>

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
  greetText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  nameText: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 2 },
  bannerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
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
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 14 },

  /* Quick Grid */
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: "46%",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  quickLabel: { fontSize: 13, fontWeight: "600" },

  /* Info Row */
  infoRow: { flexDirection: "row", gap: 10 },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  infoValue: { fontSize: 20, fontWeight: "bold" },
  infoLabel: { fontSize: 11, color: "#555", textAlign: "center" },

  /* CTA */
  ctaBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 20,
  },
  ctaTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  ctaSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
});
