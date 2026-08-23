import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../context/ThemeContext";
import { getDoctors, bookAppointment } from "../services/api";

const SPECIALIZATIONS = ["All", "General", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic", "Pediatrician", "Psychiatrist"];

const AVATAR_COLORS = ["#1565C0", "#00695C", "#6A1B9A", "#E65100", "#B71C1C", "#37474F"];

function getAvatarColor(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function DoctorsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);

  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Booking modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(res.data);
      setFiltered(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (text, spec) => {
    let list = doctors;
    if (text.trim()) {
      list = list.filter((d) =>
        d.name.toLowerCase().includes(text.toLowerCase()) ||
        (d.specialization || "").toLowerCase().includes(text.toLowerCase())
      );
    }
    if (spec !== "All") {
      list = list.filter((d) =>
        (d.specialization || "").toLowerCase().includes(spec.toLowerCase())
      );
    }
    setFiltered(list);
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilters(text, activeFilter);
  };

  const handleFilter = (spec) => {
    setActiveFilter(spec);
    applyFilters(search, spec);
  };

  const openBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setDate(new Date());
    setModalVisible(true);
  };

  const handleConfirmBook = async () => {
    setBooking(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await bookAppointment(token, {
        doctorId: selectedDoctor._id,
        date: date.toDateString(),
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setModalVisible(false);
      Alert.alert("Appointment Booked", `Request sent to Dr. ${selectedDoctor.name}.`);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={{ color: "#888", marginTop: 10 }}>Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* ── Header ── */}
      <LinearGradient colors={["#1565C0", "#0288D1"]} style={styles.header}>
        <Text style={styles.headerTitle}>Find a Doctor</Text>
        <Text style={styles.headerSub}>{filtered.length} doctors available</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            placeholder="Search by name or specialty..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* ── Specialty Filter Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
      >
        {SPECIALIZATIONS.map((spec) => (
          <TouchableOpacity
            key={spec}
            onPress={() => handleFilter(spec)}
            style={[
              styles.filterChip,
              activeFilter === spec && styles.filterChipActive,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === spec && styles.filterChipTextActive,
              ]}
            >
              {spec}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Doctor List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No doctors found</Text>
          </View>
        )}

        {filtered.map((doc) => (
          <TouchableOpacity
            key={doc._id}
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate("DoctorDetails", { doctor: doc })}
            activeOpacity={0.85}
          >
            {/* Avatar */}
            <View style={styles.cardLeft}>
              {doc.profileImage ? (
                <Image source={{ uri: doc.profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(doc.name) }]}>
                  <Text style={styles.avatarInitial}>
                    {doc.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {/* Online dot */}
              <View style={styles.onlineDot} />
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={[styles.docName, { color: theme.text }]}>
                Dr. {doc.name}
              </Text>

              {/* Specialty Badge */}
              <View style={styles.specialtyBadge}>
                <Ionicons name="ribbon-outline" size={12} color="#1565C0" />
                <Text style={styles.specialtyText}>
                  {doc.specialization || "General Physician"}
                </Text>
              </View>

              {/* Experience */}
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={13} color="#888" />
                <Text style={styles.infoText}>
                  {doc.experience ? `${doc.experience} yrs experience` : "Experienced"}
                </Text>
              </View>

              {/* Stars */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4].map((s) => (
                  <Ionicons key={s} name="star" size={13} color="#FFB300" />
                ))}
                <Ionicons name="star-half" size={13} color="#FFB300" />
                <Text style={styles.ratingText}>4.5</Text>
              </View>
            </View>

            {/* Book Button */}
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => openBooking(doc)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Booking Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedDoctor && (
              <View style={styles.modalDoctorRow}>
                <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(selectedDoctor.name), width: 48, height: 48, borderRadius: 24 }]}>
                  <Text style={[styles.avatarInitial, { fontSize: 18 }]}>
                    {selectedDoctor.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.modalDocName}>Dr. {selectedDoctor.name}</Text>
                  <Text style={styles.modalDocSpec}>
                    {selectedDoctor.specialization || "General Physician"}
                  </Text>
                </View>
              </View>
            )}

            {/* Date Picker */}
            <Text style={styles.pickerLabel}>Select Date</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#1565C0" />
              <Text style={styles.pickerBtnText}>{date.toDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                minimumDate={new Date()}
                display="default"
                onValueChange={(selected) => {
                  setShowDatePicker(false);
                  if (selected) setDate(new Date(selected.setHours(date.getHours(), date.getMinutes())));
                }}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}

            {/* Time Picker */}
            <Text style={styles.pickerLabel}>Select Time</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowTimePicker(true)}
            >
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
                onValueChange={(selected) => {
                  setShowTimePicker(false);
                  if (selected) setDate(selected);
                }}
                onDismiss={() => setShowTimePicker(false)}
              />
            )}

            {/* Confirm */}
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
                  <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* Header */
  header: {
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2, marginBottom: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  /* Filter chips */
  filterRow: { flexShrink: 0 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F0F4FF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D0D8F0",
  },
  filterChipActive: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  filterChipText: { fontSize: 13, color: "#444", fontWeight: "500" },
  filterChipTextActive: { color: "#fff", fontWeight: "700" },

  /* Doctor Card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardLeft: { position: "relative", marginRight: 14 },
  avatar: { width: 62, height: 62, borderRadius: 31 },
  avatarFallback: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#43A047",
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
    bottom: 2,
    right: 2,
  },
  cardInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  specialtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginBottom: 5,
  },
  specialtyText: { fontSize: 11, color: "#1565C0", fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  infoText: { fontSize: 12, color: "#888" },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 12, color: "#888", marginLeft: 4 },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1565C0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  bookBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  /* Empty */
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "#aaa", fontSize: 15 },

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
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A2E" },
  modalDoctorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  modalDocName: { fontSize: 15, fontWeight: "bold", color: "#1A1A2E" },
  modalDocSpec: { fontSize: 12, color: "#1565C0", marginTop: 2 },
  pickerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginLeft: 2,
  },
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
