import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Linking } from "react-native";
import CustomButton from "../components/CustomButton";
import {
  getMyAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  uploadPrescription
} from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import { all } from "axios";

export default function AppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [userRole, setUserRole] = useState("");
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    loadAppointments();
    loadRole();
  }, []);

  // ✅ Load logged user role
  const loadRole = async () => {
    const role = await AsyncStorage.getItem("role");
    setUserRole(role);
  };

  // ✅ Load appointments
  const loadAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await getMyAppointments(token);
      setAppointments(res.data || res);
    } catch (error) {
      console.log(error.response || error);
    }
  };

  // ✅ Doctor approves/rejects
  const updateStatus = async (id, status) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await updateAppointmentStatus(token, id, status);

      Alert.alert("Success ✅", "Status Updated");

      loadAppointments();
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Patient cancels
  const handleCancel = async (id) => {
    const token = await AsyncStorage.getItem("token");
    await cancelAppointment(token, id);
    loadAppointments();
  };

  // ✅ Doctor Upload Prescription
  const handleUpload = async (appointmentId) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

if (!permission.granted) {
  Alert.alert("Permission Required", "Allow media access.");
  return;
}

 const result = await ImagePicker.launchImageLibraryAsync({
  allowsEditing: true,
  quality: 1,
});
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

      Alert.alert("Success ✅", "Prescription Uploaded");

      loadAppointments();
    } catch (error) {
      console.log(error);
      Alert.alert("Error ❌", "Upload Failed");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        My Appointments
      </Text>

      <ScrollView>
        {appointments.length === 0 && (
          <Text style={styles.empty}>No Appointments Found</Text>
        )}

        {appointments.map((item) => (
          <View
            key={item._id}
            style={[styles.card, { backgroundColor: theme.colors.card }]}
          >
            <Text>Doctor: {item.doctor?.name}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time}</Text>

            {/* ✅ Status */}
            <Text
              style={{
                fontWeight: "bold",
                marginVertical: 5,
                color:
                  item.status === "pending"
                    ? theme.colors.warning
                    : item.status === "approved"
                    ? theme.colors.success
                    : item.status === "rejected"
                    ? theme.colors.danger
                    : theme.colors.text,
              }}
            >
              Status: {item.status.toUpperCase()}
            </Text>

            {/* ✅ Doctor Approve/Reject */}
            {item.status === "pending" && userRole === "doctor" && (
              <>
                <CustomButton
                  title="Approve ✅"
                  onPress={() => updateStatus(item._id, "approved")}
                />

                <CustomButton
                  title="Reject ❌"
                  color={theme.colors.danger}
                  onPress={() => updateStatus(item._id, "rejected")}
                />
              </>
            )}

            {/* ✅ Patient Cancel */}
            {item.status === "pending" && userRole === "patient" && (
              <CustomButton
                title="Cancel Appointment"
                color={theme.colors.danger}
                onPress={() => handleCancel(item._id)}
              />
            )}

            {/* ✅ Doctor Upload Prescription */}
            {item.status === "approved" && userRole === "doctor" && (
              <CustomButton
                title="Upload Prescription 📄"
                onPress={() => handleUpload(item._id)}
              />
            )}

            {/* ✅ Patient View Prescription */}
            {item.prescription && userRole === "patient" && (
              <CustomButton
                title="View Prescription 👁️"
                onPress={() => Linking.openURL(item.prescription)}
              />
            )}

            {/* ✅ Open Chat */}
            <CustomButton
              title="Open Chat 💬"
              onPress={() =>
                navigation.navigate("Chat", {
                  appointmentId: item._id,
                })
              }
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 4,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
  },
});