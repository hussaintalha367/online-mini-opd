import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../utils/colors";
import CustomButton from "../components/CustomButton";
import {
  getMyAppointments,
  cancelAppointment,
  updateAppointmentStatus
} from "../services/api";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

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

      loadAppointments(); // refresh list
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>

      <ScrollView>

        {appointments.length === 0 && (
          <Text style={styles.empty}>No Appointments Found</Text>
        )}

        {appointments.map((item) => (

          <View key={item._id} style={styles.card}>

            <Text>Doctor: {item.doctor?.name}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time}</Text>

            {/* ✅ Status with Color */}
            <Text style={{
              fontWeight: "bold",
              marginVertical: 5,
              color:
                item.status === "pending" ? theme.colors.warning :
                item.status === "approved" ? theme.colors.success :
                item.status === "rejected" ? theme.colors.danger :
                theme.colors.text
            }}>
              Status: {item.status.toUpperCase()}
            </Text>

            {/* ✅ Doctor Approval Buttons */}
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

            {/* ✅ Patient Cancel Button */}
            {item.status === "pending" && userRole === "patient" && (
              <CustomButton
                title="Cancel Appointment"
                color={theme.colors.danger}
                onPress={() => handleCancel(item._id)}
              />
            )}

            {/* ✅ Open Chat Button */}
            <CustomButton
              title="Open Chat"
              onPress={() =>
                navigation.navigate("Chat", { appointmentId: item._id })
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
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10
  },
  card: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 4
  },
  empty: {
    textAlign: "center",
    marginTop: 30
  }
});