import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { registerUser } from "../services/api";

export default function RegisterScreen({ navigation }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");

  const handleRegister = async () => {
    try {
      await registerUser({ name, email, password, role });
      Alert.alert("Success ✅", "Account Created");
      navigation.replace("Login");
    } catch {
      Alert.alert("Error", "Registration Failed");
    }
  };

  return (
    <LinearGradient colors={["#1976D2", "#26A69A"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <CustomInput placeholder="Full Name" onChangeText={setName} />
          <CustomInput placeholder="Email" onChangeText={setEmail} />
          <CustomInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

          <CustomButton title="Register" onPress={handleRegister} />

        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    elevation: 8
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15
  }
});