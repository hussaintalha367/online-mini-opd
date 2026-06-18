import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../context/ThemeContext";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../services/api";

export default function LoginScreen({ navigation, setRole }) {

  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginUser(email, password);
      const data = res.data || res;

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("role", data.user.role);

      setRole(data.user.role);
    } catch (error) {
      Alert.alert("Login Failed", "Invalid credentials");
    }
  };

  return (
    <LinearGradient colors={["#1976D2", "#26A69A"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", padding: 24 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Continue your healthcare journey
          </Text>

          <CustomInput placeholder="Email" onChangeText={setEmail} />
          <CustomInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

          <CustomButton title="Sign In" onPress={handleLogin} />

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    elevation: 8
  },
  title: {
    fontSize: 22,
    fontWeight: "bold"
  },
  subtitle: {
    marginBottom: 20,
    color: "#666"
  },
  registerText: {
    marginTop: 15,
    textAlign: "center",
    color: "#1976D2"
  }
});