import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMyAppointments } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";

export default function NotificationModal({ visible, onClose, navigation, role }) {
  const { theme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        return;
      }
      const res = await getMyAppointments(token);
      const appts = res.data || [];

      // Sort by newest
      const sorted = [...appts].sort(
        (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );

      // Map appointments to notifications
      const notifs = sorted.slice(0, 15).map((appt) => {
        const isDoc = role === "doctor";
        const otherParty = isDoc
          ? appt.patient?.name || "Patient"
          : appt.doctor?.name ? `Dr. ${appt.doctor.name}` : "Doctor";

        let title = "";
        let message = "";
        let icon = "notifications-outline";
        let color = "#1565C0";
        let bg = "#E3F2FD";

        switch (appt.status) {
          case "pending":
            if (isDoc) {
              title = "New Appointment Request 📋";
              message = `${otherParty} requested an appointment on ${appt.date} at ${appt.time}.`;
            } else {
              title = "Request Under Review ⏳";
              message = `Your request with ${otherParty} on ${appt.date} at ${appt.time} is awaiting confirmation.`;
            }
            icon = "time-outline";
            color = "#E65100";
            bg = "#FFF3E0";
            break;

          case "approved":
            title = isDoc ? "Upcoming Consultation 🩺" : "Appointment Approved! 🎉";
            message = `Consultation with ${otherParty} scheduled for ${appt.date} at ${appt.time}. Chat is now open.`;
            icon = "checkmark-circle-outline";
            color = "#2E7D32";
            bg = "#E8F5E9";
            break;

          case "completed":
            title = "Consultation Completed ✅";
            message = isDoc
              ? `Completed session with ${otherParty}.`
              : `${otherParty} completed the consultation. Prescription is available.`;
            icon = "document-text-outline";
            color = "#00838F";
            bg = "#E0F7FA";
            break;

          case "rejected":
            title = "Appointment Declined ❌";
            message = `Appointment on ${appt.date} was declined.`;
            icon = "close-circle-outline";
            color = "#C62828";
            bg = "#FFEBEE";
            break;

          default:
            title = "Appointment Update";
            message = `Status: ${appt.status} for ${appt.date}.`;
            icon = "calendar-outline";
            color = "#546E7A";
            bg = "#ECEFF1";
        }

        return {
          id: appt._id,
          title,
          message,
          icon,
          color,
          bg,
          status: appt.status,
          date: appt.date,
          time: appt.time,
          otherParty,
          raw: appt,
        };
      });

      setNotifications(notifs);
    } catch (e) {
      console.log("Load notifs error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePressItem = (item) => {
    onClose();
    if (item.status === "approved") {
      // Go to Chat or Appointments
      navigation.navigate("Chat", {
        appointmentId: item.raw._id,
        otherName: item.otherParty,
        otherRole: role === "doctor" ? "patient" : "doctor",
      });
    } else {
      navigation.navigate("Appointments");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          {/* ── Sheet Header ── */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconCircle, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="notifications" size={20} color="#1565C0" />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>
                  Notifications
                </Text>
                <Text style={styles.sheetSub}>
                  {notifications.length} recent update{notifications.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* ── Content ── */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#1565C0" />
              <Text style={styles.loadingText}>Fetching updates...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={44} color="#90A4AE" />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>All Caught Up!</Text>
              <Text style={styles.emptySub}>
                You don't have any recent notifications right now.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notifCard, { backgroundColor: theme.background }]}
                  activeOpacity={0.75}
                  onPress={() => handlePressItem(item)}
                >
                  <View style={[styles.itemIconCircle, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={[styles.badgePill, { backgroundColor: item.bg }]}>
                        <Text style={[styles.badgeText, { color: item.color }]}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.itemMessage}>
                      {item.message}
                    </Text>

                    <View style={styles.cardFooter}>
                      <View style={styles.footerTimeRow}>
                        <Ionicons name="calendar-outline" size={12} color="#888" />
                        <Text style={styles.footerDateText}>
                          {item.date} • {item.time}
                        </Text>
                      </View>

                      <View style={styles.actionPrompt}>
                        <Text style={[styles.actionPromptText, { color: item.color }]}>
                          {item.status === "approved" ? "Open Chat" : "View"}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={item.color} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* ── Footer ── */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => {
                onClose();
                navigation.navigate("Appointments");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllBtnText}>View All Appointments</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    minHeight: "50%",
    paddingTop: 16,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sheetSub: {
    fontSize: 12,
    color: "#78909C",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    color: "#888",
    fontSize: 14,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ECEFF1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptySub: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 19,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  notifCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  itemIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    marginRight: 6,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  itemMessage: {
    fontSize: 13,
    color: "#546E7A",
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerDateText: {
    fontSize: 11,
    color: "#888",
  },
  actionPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionPromptText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sheetFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ECEFF1",
  },
  viewAllBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 2,
  },
  viewAllBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
