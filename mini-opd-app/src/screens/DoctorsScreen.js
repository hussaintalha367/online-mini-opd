import React, { useEffect, useState,useRef} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../utils/colors";
import CustomButton from "../components/CustomButton";
import { getDoctors, bookAppointment } from "../services/api";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function DoctorsScreen() {
  const [mode, setMode] = useState("date");
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    const res = await getDoctors();
    setDoctors(res.data);
    setFilteredDoctors(res.data);
    setLoading(false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = doctors.filter((doc) =>
      doc.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  const handleBook = async () => {
    if (!selectedDoctor) return;

    const token = await AsyncStorage.getItem("token");

    await bookAppointment(token, {
      doctorId: selectedDoctor,
      date: date.toDateString(),
      time: date.toLocaleTimeString()
    });

    alert("Appointment Requested ✅");

    setSelectedDoctor(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.colors.text }}>Available Doctors</Text>

      <TextInput
        placeholder="Search Doctor..."
        value={search}
        onChangeText={handleSearch}
        style={styles.search}
      />

      <ScrollView>

        {filteredDoctors.map((doc) => (

          <View key={doc._id} style={styles.card}>

            <Text style={styles.name}>{doc.name}</Text>
            <Text>{doc.specialization}</Text>

            <CustomButton
              title="Select Slot"
              onPress={() => setSelectedDoctor(doc._id)}
            />

          </View>
        ))}

      </ScrollView>

      {/* ✅ Show Date Picker When Doctor Selected */}
      {selectedDoctor && (
        <View style={styles.slotContainer}>

          <Text style={{ fontWeight: "bold" }}>
            Select Date & Time
          </Text>

        <TouchableOpacity
  style={styles.dateButton}
  onPress={() => {
    setMode("date");
    setShowPicker(true);
  }}
>
  <Text>
  Select Date: {date ? new Date(date).toDateString() : ""}
</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.dateButton}
  onPress={() => {
    setMode("time");
    setShowPicker(true);
  }}
>
  <Text>Select Time: {date ? new Date(date).toLocaleTimeString() : ""}</Text>
</TouchableOpacity>

       {showPicker && (
  <DateTimePicker
    value={date instanceof Date ? date : new Date()}
    mode={mode}
    display="default"
    onChange={(event, selectedDate) => {
      setShowPicker(false);

      if (selectedDate instanceof Date) {
        setDate(selectedDate);
      }
    }}
  />
)}

          <CustomButton
            title="Confirm Appointment"
            onPress={handleBook}
          />

        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10
  },
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4
  },
  name: {
    fontSize: 18,
    fontWeight: "bold"
  },
  slotContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ccc"
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});