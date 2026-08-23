import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Linking } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import {
  getMyAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  uploadPrescription,
} from "../services/api";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected", "Completed"];

const STATUS_CONFIG = {
  pending:   { color: "#E65100", bg: "#FFF3E0", icon: "time-outline" },
  approved:  { color: "#2E7D32", bg: "#E8F5E9", icon: "checkmark-circle-outline" },
  rejected:  { color: "#B71C1C", bg: "#FFEBEE", icon: "close-circle-outline" },
  completed: { color: "#1565C0", bg: "#E3F2FD", icon: "checkmark-done-circle-outline" },
  cancelled: { color: "#555",    bg: "#ECEFF1", icon: "ban-outline" },
};

export default function AppointmentsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);

  const [appointments, setAppointments] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRole();
    loadAppointments();
  }, []);

  const loadRole = async () => {
    const role = await AsyncStorage.getItem("role");
    setUserRole(role || "");
  };

  const loadAppointments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await getMyAppointments(token);
      setAppointments(res.data || []);
    } catch (e) {
      console.log(e?.response || e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments(true);
  };

  const filteredList = appointments.filter((a) => {
    if (activeTab === "All") return true;
    return a.status?.toLowerCase() === activeTab.toLowerCase();
  });

  /* ── Actions ── */
  const updateStatus = async (id, status) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await updateAppointmentStatus(token, id, status);
      Alert.alert("Status Updated", `Appointment marked as ${status}.`);
      loadAppointments(true);
    } catch (e) {
      Alert.alert("Error", "Could not update status.");
    }
  };

  const handleCancel = (id) => {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");
          await cancelAppointment(token, id);
          loadAppointments(true);
        },
      },
    ]);
  };

  const handleUpload = async (appointmentId) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Allow media library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    if (result.canceled) return;

    const token = await AsyncStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", {
      uri: result.assets[0].uri,
      type: "image/jpeg",
      name: "prescription.jpg",
    });
    try {
      await uploadPrescription(token, appointmentId, formData);
      Alert.alert("Uploaded", "Prescription uploaded successfully.");
      loadAppointments(true);
    } catch (e) {
      Alert.alert("Error", "Upload failed. Try again.");
    }
  };

  const handleComplete = async (id) => {
    await updateStatus(id, "completed");
  };

  /* ── Render ── */
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#00695C" />

      {/* Header */}
      <LinearGradient colors={["#00695C", "#00897B"]} style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <Text style={styles.headerSub}>{appointments.length} total appointments</Text>
      </LinearGradient>

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabRow}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
      >
        {STATUS_TABS.map((tab) => {
          const count = tab === "All"
            ? appointments.length
            : appointments.filter((a) => a.status?.toLowerCase() === tab.toLowerCase()).length;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab && { color: "#00695C" }]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00695C" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#00695C"]}
            />
          }
        >
          {filteredList.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={56} color="#ccc" />
              <Text style={styles.emptyTitle}>No appointments</Text>
              <Text style={styles.emptyText}>
                {activeTab === "All"
                  ? "You have no appointments yet."
                  : `No ${activeTab.toLowerCase()} appointments.`}
              </Text>
            </View>
          )}

          {filteredList.map((item) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const isDoctor = userRole === "doctor";
            const isPatient = userRole === "patient";

            return (
              <View
                key={item._id}
                style={[styles.card, { backgroundColor: theme.card }]}
              >
                {/* Card Top Row */}
                <View style={styles.cardTop}>
                  {/* Status badge */}
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>
                      {item.status?.toUpperCase()}
                    </Text>
                  </View>

                  {/* Date chip */}
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar-outline" size={12} color="#888" />
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>
                </View>

                {/* Doctor / Patient Info */}
                <View style={styles.personRow}>
                  <View style={styles.personAvatar}>
                    <Ionicons name="person" size={20} color="#1565C0" />
                  </View>
                  <View>
                    <Text style={styles.personRole}>
                      {isDoctor ? "Patient" : "Doctor"}
                    </Text>
                    <Text style={[styles.personName, { color: theme.text }]}>
                      {isDoctor
                        ? item.patient?.name || "—"
                        : `Dr. ${item.doctor?.name || "—"}`}
                    </Text>
                    {!isDoctor && item.doctor?.specialization && (
                      <Text style={styles.personSpec}>{item.doctor.specialization}</Text>
                    )}
                  </View>
                </View>

                {/* Time Row */}
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={14} color="#888" />
                  <Text style={styles.timeText}>{item.time || "—"}</Text>
                </View>

                {/* ── Action Buttons ── */}
                <View style={styles.actionsCol}>

                  {/* Doctor: Approve / Reject when pending */}
                  {item.status === "pending" && isDoctor && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => updateStatus(item._id, "approved")}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => updateStatus(item._id, "rejected")}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle-outline" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Doctor: Upload prescription + Mark complete when approved */}
                  {item.status === "approved" && isDoctor && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.uploadBtn]}
                        onPress={() => handleUpload(item._id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Upload Rx</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.completeBtn]}
                        onPress={() => handleComplete(item._id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark-done-circle-outline" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Complete</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Patient: Cancel when pending */}
                  {item.status === "pending" && isPatient && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.cancelBtn, { alignSelf: "flex-start" }]}
                      onPress={() => handleCancel(item._id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}

                  {/* Patient: View prescription */}
                  {item.prescription && isPatient && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rxBtn]}
                      onPress={() => Linking.openURL(item.prescription)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="document-text-outline" size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>View Prescription</Text>
                    </TouchableOpacity>
                  )}

                  {/* Open Chat */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.chatBtn]}
                    onPress={() => navigation.navigate("Chat", { appointmentId: item._id })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Open Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  loadingText: { color: "#888", fontSize: 14 },

  /* Header */
  header: {
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },

  /* Tabs */
  tabRow: { flexShrink: 0 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F4F0",
    marginRight: 8,
    gap: 6,
  },
  tabActive: { backgroundColor: "#00695C" },
  tabText: { fontSize: 13, color: "#555", fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  tabBadge: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  tabBadgeText: { fontSize: 11, fontWeight: "bold", color: "#00695C" },

  /* Card */
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  dateText: { fontSize: 11, color: "#666" },

  /* Person Row */
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  personAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  personRole: { fontSize: 11, color: "#888" },
  personName: { fontSize: 15, fontWeight: "bold" },
  personSpec: { fontSize: 12, color: "#1565C0" },

  /* Time Row */
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  timeText: { fontSize: 13, color: "#777" },

  /* Actions */
  actionsCol: { gap: 8 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  approveBtn: { backgroundColor: "#2E7D32" },
  rejectBtn:  { backgroundColor: "#B71C1C" },
  cancelBtn:  { backgroundColor: "#B71C1C", flex: 0, paddingHorizontal: 16 },
  uploadBtn:  { backgroundColor: "#1565C0" },
  completeBtn:{ backgroundColor: "#00695C" },
  rxBtn:      { backgroundColor: "#6A1B9A", flex: 0 },
  chatBtn:    { backgroundColor: "#0288D1" },

  /* Empty */
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#aaa" },
  emptyText: { color: "#bbb", fontSize: 14, textAlign: "center" },
});
