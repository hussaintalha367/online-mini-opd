import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../components/CustomButton";
import Colors from "../utils/colors";

export default function AdminDashboard({ setRole }) {

  const logout = async () => {
    await AsyncStorage.clear();
    setRole(null);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Admin Dashboard 🛠</Text>

      <CustomButton
        title="👥 View All Users"
        onPress={() => alert("Connect to admin users API")}
      />

      <CustomButton
        title="📅 View All Appointments"
        onPress={() => alert("Connect to admin appointments API")}
      />

      <CustomButton
        title="🚪 Logout"
        color={Colors.danger}
        onPress={logout}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30
  }
});