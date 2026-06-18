import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../components/CustomButton";
import Colors from "../utils/colors";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {Switch } from "react-native";

export default function ProfileScreen({ setRole }) {

  const { theme, darkMode, setDarkMode } = useContext(ThemeContext);
  const [role, setUserRole] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const savedRole = await AsyncStorage.getItem("role");
    const savedToken = await AsyncStorage.getItem("token");

    setUserRole(savedRole || "No Role Found");
    setToken(savedToken ? "Logged In ✅" : "Not Logged In");
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setRole(null);
  };

  return (
  <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

    <Text style={[styles.title, { color: theme.colors.text }]}>
      My Profile
    </Text>

    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>

      <Text style={{ color: theme.colors.text }}>
        Dark Mode
      </Text>

      <Switch 
        value={darkMode}
        onValueChange={setDarkMode}
      />

    </View>

    <CustomButton
      title="Logout"
      color={theme.colors.danger}
      onPress={logout}
    />

  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    fontSize: 16,
    marginTop: 5
  }
});