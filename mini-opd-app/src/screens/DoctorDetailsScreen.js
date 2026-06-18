import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

export default function DoctorDetailsScreen({ route }) {

  const { doctor } = route.params;
  const { theme } = useContext(ThemeContext);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* ✅ Doctor Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
          style={styles.image}
        />
      </View>

      {/* ✅ Doctor Info Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>

        <Text style={[styles.name, { color: theme.colors.text }]}>
          Dr. {doctor.name}
        </Text>

        <Text style={{ color: theme.colors.secondaryText }}>
          {doctor.specialization}
        </Text>

        {/* ✅ Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Ionicons name="star" size={16} color="#FFD700" />
          <Ionicons name="star" size={16} color="#FFD700" />
          <Ionicons name="star" size={16} color="#FFD700" />
          <Ionicons name="star-outline" size={16} color="#FFD700" />
        </View>

        {/* ✅ Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>20K</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {doctor.experience || 0} yrs
            </Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* ✅ About */}
        <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>
          About
        </Text>

        <Text style={{ color: theme.colors.secondaryText }}>
          Experienced medical professional committed to providing quality care.
        </Text>

        {/* ✅ Book Button */}
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookText}>Book Appointment</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  imageContainer: {
    alignItems: "center",
    marginTop: 20
  },

  image: {
    width: 140,
    height: 140,
    borderRadius: 70
  },

  card: {
    margin: 20,
    padding: 20,
    borderRadius: 25,
    elevation: 6
  },

  name: {
    fontSize: 22,
    fontWeight: "bold"
  },

  ratingRow: {
    flexDirection: "row",
    marginVertical: 8
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15
  },

  statCard: {
    alignItems: "center"
  },

  statNumber: {
    fontWeight: "bold"
  },

  statLabel: {
    fontSize: 12,
    color: "#666"
  },

  aboutTitle: {
    fontWeight: "bold",
    marginTop: 10
  },

  bookButton: {
    backgroundColor: "#1976D2",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20
  },

  bookText: {
    color: "#fff",
    fontWeight: "bold"
  }
});