import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../components/CustomInput";
import { registerUser } from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (role === "doctor" && !specialization.trim()) {
      Alert.alert("Missing Fields", "Please enter your specialization.");
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        specialization: role === "doctor" ? specialization.trim() : "",
        experience: role === "doctor" ? Number(experience) : 0,
      });
      Alert.alert("Success ✅", "Account created! Please sign in.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#1565C0", "#0288D1", "#26A69A"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add-outline" size={36} color="#fff" />
            </View>
            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.appSub}>Join the Mini OPD platform</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Name */}
            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <CustomInput
                placeholder="Enter your full name"
                onChangeText={setName}
                value={name}
                style={styles.inputField}
              />
            </View>

            {/* Email */}
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <CustomInput
                placeholder="Enter your email"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.inputField}
              />
            </View>

            {/* Password */}
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <CustomInput
                placeholder="Min. 6 characters"
                secureTextEntry={!showPass}
                onChangeText={setPassword}
                value={password}
                style={styles.inputField}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPass ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* Role Selector */}
            <Text style={styles.fieldLabel}>Register As</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, role === "patient" && styles.roleBtnActive]}
                onPress={() => setRole("patient")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color={role === "patient" ? "#fff" : "#555"}
                />
                <Text style={[styles.roleText, role === "patient" && styles.roleTextActive]}>
                  Patient
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, role === "doctor" && styles.roleBtnActive]}
                onPress={() => setRole("doctor")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="medkit"
                  size={20}
                  color={role === "doctor" ? "#fff" : "#555"}
                />
                <Text style={[styles.roleText, role === "doctor" && styles.roleTextActive]}>
                  Doctor
                </Text>
              </TouchableOpacity>
            </View>

            {/* Doctor Extra Fields */}
            {role === "doctor" && (
              <View style={styles.doctorSection}>
                <View style={styles.doctorDivider}>
                  <Ionicons name="information-circle-outline" size={16} color="#0288D1" />
                  <Text style={styles.doctorDividerText}>Doctor Details</Text>
                </View>

                <Text style={styles.fieldLabel}>Specialization</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="ribbon-outline" size={20} color="#888" style={styles.inputIcon} />
                  <CustomInput
                    placeholder="e.g. Cardiologist, General Physician"
                    onChangeText={setSpecialization}
                    value={specialization}
                    style={styles.inputField}
                  />
                </View>

                <Text style={styles.fieldLabel}>Years of Experience</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="time-outline" size={20} color="#888" style={styles.inputIcon} />
                  <CustomInput
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    onChangeText={setExperience}
                    value={experience}
                    style={styles.inputField}
                  />
                </View>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{" "}
                <Text style={styles.loginLinkBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  appSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E8ECF4",
    borderRadius: 14,
    backgroundColor: "#F7F8FA",
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    fontSize: 15,
    color: "#1A1A2E",
  },
  eyeIcon: {
    padding: 4,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E8ECF4",
    gap: 8,
    backgroundColor: "#F7F8FA",
  },
  roleBtnActive: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
  roleText: {
    fontWeight: "600",
    color: "#555",
    fontSize: 14,
  },
  roleTextActive: {
    color: "#fff",
  },
  doctorSection: {
    backgroundColor: "#F0F7FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  doctorDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  doctorDividerText: {
    color: "#0288D1",
    fontWeight: "600",
    fontSize: 13,
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: "#1565C0",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 18,
  },
  loginLinkText: {
    color: "#666",
    fontSize: 14,
  },
  loginLinkBold: {
    color: "#1565C0",
    fontWeight: "bold",
  },
});
