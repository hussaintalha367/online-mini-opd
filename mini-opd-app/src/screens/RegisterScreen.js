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
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");

  const handleRegister = async () => {
    try {
      await registerUser({
        name,
        email,
        password,
        role,
        specialization: role === "doctor" ? specialization : "",
        experience: role === "doctor" ? experience : ""
      });

      Alert.alert("Success ✅", "Account Created");
      navigation.replace("Login");

    } catch (error) {
      Alert.alert("Error", "Registration Failed");
    }
  };

  return (
    <LinearGradient
      colors={["#1976D2", "#26A69A"]}
      style={{ flex: 1, justifyContent: "center", padding: 24 }}
    >
      <View style={styles.card}>

        <Text style={styles.title}>Create Account</Text>

        <CustomInput placeholder="Full Name" onChangeText={setName} />
        <CustomInput placeholder="Email" onChangeText={setEmail} />
        <CustomInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

        {/* ✅ ROLE SELECTION */}
        <Text style={styles.roleLabel}>Select Role</Text>

        <View style={styles.roleContainer}>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "patient" && styles.selectedRole
            ]}
            onPress={() => setRole("patient")}
          >
            <Text
              style={[
                styles.roleText,
                role === "patient" && styles.selectedRoleText
              ]}
            >
              Patient
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "doctor" && styles.selectedRole
            ]}
            onPress={() => setRole("doctor")}
          >
            <Text
              style={[
                styles.roleText,
                role === "doctor" && styles.selectedRoleText
              ]}
            >
              Doctor
            </Text>
          </TouchableOpacity>

        </View>

        {/* ✅ DOCTOR EXTRA FIELDS */}
        {role === "doctor" && (
          <>
            <CustomInput
              placeholder="Specialization (e.g. Cardiologist)"
              onChangeText={setSpecialization}
            />
            <CustomInput
              placeholder="Experience (years)"
              keyboardType="numeric"
              onChangeText={setExperience}
            />
          </>
        )}

        <CustomButton title="Register" onPress={handleRegister} />

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    elevation: 8
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20
  },
  roleLabel: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 8
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    marginHorizontal: 5
  },
  selectedRole: {
    backgroundColor: "#1976D2",
    borderColor: "#1976D2"
  },
  roleText: {
    fontWeight: "600",
    color: "#333"
  },
  selectedRoleText: {
    color: "#fff"
  }
});