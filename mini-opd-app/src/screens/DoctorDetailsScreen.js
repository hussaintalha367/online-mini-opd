import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";
import { bookAppointment } from "../services/api";

const AVATAR_COLORS = ["#1565C0", "#00695C", "#6A1B9A", "#E65100", "#B71C1C", "#37474F"];
function getAvatarColor(name = "") {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function DoctorDetailsScreen({ route, navigation }) {
  const { doctor } = route.params;
  const { theme } = useContext(ThemeContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [booking, setBooking] = useState(false);

  const handleConfirmBook = async () => {
    setBooking(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await bookAppointment(token, {
        doctorId: doctor._id,
        date: date.toDateString(),
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setModalVisible(false);
      Alert.alert("Appointment Booked", `Request sent to Dr. ${doctor.name}.`);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* ── Gradient Hero ── */}
      <LinearGradient colors={["#1565C0", "#0288D1"]} style={styles.hero}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Avatar */}
        {doctor.profileImage ? (
          <Image source={{ uri: doctor.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(doctor.name) }]}>
            <Text style={styles.avatarInitial}>{doctor.name?.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <Text style={styles.heroName}>Dr. {doctor.name}</Text>

        {/* Specialty Badge */}
        <View style={styles.specialtyBadge}>
          <Ionicons name="ribbon-outline" size={13} color="#fff" />
          <Text style={styles.specialtyText}>
            {doctor.specialization || "General Physician"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Stats Row ── */}
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          {[
            { icon: "people",       value: "500+",                        label: "Patients" },
            { icon: "time-outline", value: `${doctor.experience || 0}+`,  label: "Years Exp." },
            { icon: "star",         value: "4.8",                         label: "Rating" },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Ionicons name={s.icon} size={22} color="#1565C0" />
              <Text style={[styles.statValue, { color: theme.text }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── About ── */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          <Text style={styles.aboutText}>
            Dr. {doctor.name} is an experienced{" "}
            {doctor.specialization || "medical professional"} with{" "}
            {doctor.experience || "several"} years of practice. Committed to
            delivering quality patient care with compassion and expertise.
          </Text>
        </View>

        {/* ── Details ── */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Details</Text>

          {[
            { icon: "ribbon",          label: "Specialization", value: doctor.specialization || "General" },
            { icon: "time",            label: "Experience",     value: `${doctor.experience || 0} years` },
            { icon: "mail-outline",    label: "Email",          value: doctor.email || "—" },
            { icon: "call-outline",    label: "Phone",          value: doctor.phone || "—" },
          ].map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name={item.icon} size={18} color="#1565C0" />
              </View>
              <View>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Reviews stub ── */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Patient Reviews</Text>
          {[
            { name: "Ali Khan",     text: "Very professional and helpful doctor.", stars: 5 },
            { name: "Sara Ahmed",   text: "Explained everything clearly. Highly recommend!", stars: 5 },
            { name: "Usman Malik",  text: "Good experience. Short waiting time.", stars: 4 },
          ].map((r) => (
            <View key={r.name} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{r.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={[styles.reviewName, { color: theme.text }]}>{r.name}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color="#FFB300" />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky Book Button ── */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* ── Booking Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Appointment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDocRow}>
              <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(doctor.name), width: 46, height: 46, borderRadius: 23 }]}>
                <Text style={[styles.avatarInitial, { fontSize: 18 }]}>{doctor.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.modalDocName}>Dr. {doctor.name}</Text>
                <Text style={styles.modalDocSpec}>{doctor.specialization || "General Physician"}</Text>
              </View>
            </View>

            <Text style={styles.pickerLabel}>Select Date</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#1565C0" />
              <Text style={styles.pickerBtnText}>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                minimumDate={new Date()}
                display="default"
                onValueChange={(sel) => {
                  setShowDatePicker(false);
                  if (sel) setDate(new Date(sel.setHours(date.getHours(), date.getMinutes())));
                }}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}

            <Text style={styles.pickerLabel}>Select Time</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={18} color="#1565C0" />
              <Text style={styles.pickerBtnText}>
                {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onValueChange={(sel) => {
                  setShowTimePicker(false);
                  if (sel) setDate(sel);
                }}
                onDismiss={() => setShowTimePicker(false)}
              />
            )}

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmBook}
              disabled={booking}
              activeOpacity={0.85}
            >
              {booking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Hero */
  hero: {
    paddingTop: 52,
    paddingBottom: 28,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 8,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" },
  avatarFallback: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.5)",
  },
  avatarInitial: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  heroName: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 12 },
  specialtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    gap: 6,
    marginTop: 6,
  },
  specialtyText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  /* Stats Card */
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 18,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: "#888" },

  /* Sections */
  section: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  aboutText: { color: "#666", lineHeight: 22, fontSize: 14 },

  /* Details */
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#E3F2FD",
    justifyContent: "center", alignItems: "center",
  },
  detailLabel: { fontSize: 11, color: "#888" },
  detailValue: { fontSize: 14, fontWeight: "600", marginTop: 1 },

  /* Reviews */
  reviewCard: {
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#1565C0",
    justifyContent: "center", alignItems: "center",
  },
  reviewAvatarText: { color: "#fff", fontWeight: "bold" },
  reviewName: { fontSize: 13, fontWeight: "600" },
  starsRow: { flexDirection: "row", gap: 2 },
  reviewText: { color: "#666", fontSize: 13, lineHeight: 20 },

  /* Sticky Bottom */
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    elevation: 10,
  },
  bookButton: {
    flexDirection: "row",
    backgroundColor: "#1565C0",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 4,
  },
  bookButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A2E" },
  modalDocRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  modalDocName: { fontSize: 15, fontWeight: "bold", color: "#1A1A2E" },
  modalDocSpec: { fontSize: 12, color: "#1565C0", marginTop: 2 },
  pickerLabel: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 8, marginLeft: 2 },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D0D8F0",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    backgroundColor: "#F7F8FA",
  },
  pickerBtnText: { fontSize: 14, color: "#333" },
  confirmBtn: {
    flexDirection: "row",
    backgroundColor: "#1565C0",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    elevation: 3,
  },
  confirmBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
