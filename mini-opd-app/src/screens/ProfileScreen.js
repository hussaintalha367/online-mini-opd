import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile, uploadProfileImage } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";

export default function ProfileScreen({ setRole }) {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [role, setUserRole]   = useState("");
  const [image, setImage]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setUserRole(user.role || "");
        setImage(user.profileImage || "");
      }
    } catch (_) {}
  };

  /* ── Save Profile ── */
  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await updateProfile(token, { name: name.trim(), email: email.trim() });

      // Sync local storage
      const raw = await AsyncStorage.getItem("user");
      if (raw) {
        const stored = JSON.parse(raw);
        stored.name  = res.data.user.name;
        stored.email = res.data.user.email;
        await AsyncStorage.setItem("user", JSON.stringify(stored));
      }

      Alert.alert("Success ✅", "Profile updated successfully.");
    } catch (_) {
      Alert.alert("Error ❌", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Upload Profile Image (Bug Fixed — no duplicate call) ── */
  const handleImageUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow media library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const token    = await AsyncStorage.getItem("token");
    const localUri = result.assets[0].uri;
    const filename = localUri.split("/").pop();
    const match    = /\.(\w+)$/.exec(filename);
    const type     = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();
    formData.append("file", { uri: localUri, name: filename, type });

    setUploading(true);
    try {
      const res = await uploadProfileImage(token, formData);

      setImage(res.data.url);

      // Sync local storage
      const raw = await AsyncStorage.getItem("user");
      if (raw) {
        const stored = JSON.parse(raw);
        stored.profileImage = res.data.url;
        await AsyncStorage.setItem("user", JSON.stringify(stored));
      }

      Alert.alert("Success ✅", "Profile photo updated.");
    } catch (err) {
      console.log(err?.response || err);
      Alert.alert("Upload Failed ❌", "Could not upload image. Try again.");
    } finally {
      setUploading(false);
    }
  };

  /* ── Logout ── */
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          setRole(null);
        },
      },
    ]);
  };

  const roleColor = role === "doctor" ? "#00695C" : role === "admin" ? "#4A148C" : "#1565C0";
  const roleBg    = role === "doctor" ? "#E0F2F1" : role === "admin" ? "#EDE7F6" : "#E3F2FD";
  const roleLabel = role === "doctor" ? "Doctor" : role === "admin" ? "Admin" : "Patient";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={roleColor} />

      {/* ── Hero Header ── */}
      <LinearGradient
        colors={
          role === "doctor"
            ? ["#00695C", "#00897B"]
            : role === "admin"
            ? ["#4A148C", "#7B1FA2"]
            : ["#1565C0", "#0288D1"]
        }
        style={styles.hero}
      >
        {/* Avatar with upload overlay */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleImageUpload}
          activeOpacity={0.85}
        >
          {uploading ? (
            <View style={[styles.avatar, styles.avatarLoading]}>
              <ActivityIndicator color="#fff" size="large" />
            </View>
          ) : (
            <Image
              source={
                image
                  ? { uri: image }
                  : require("../../assets/profile.png")
              }
              style={styles.avatar}
            />
          )}
          {/* Camera overlay */}
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.heroName}>{name || "User"}</Text>
        <Text style={styles.heroEmail}>{email}</Text>

        {/* Role Badge */}
        <View style={[styles.roleBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Ionicons
            name={role === "doctor" ? "medkit-outline" : role === "admin" ? "shield-outline" : "person-outline"}
            size={13}
            color="#fff"
          />
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Edit Profile Card ── */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Edit Profile</Text>

          {/* Name */}
          <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
          <View style={[styles.inputRow, { borderColor: darkMode ? "#333" : "#E8ECF4", backgroundColor: darkMode ? "#2A2A2A" : "#F7F8FA" }]}>
            <Ionicons name="person-outline" size={18} color="#888" />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#aaa"
              style={[styles.inputField, { color: theme.text }]}
            />
          </View>

          {/* Email */}
          <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
          <View style={[styles.inputRow, { borderColor: darkMode ? "#333" : "#E8ECF4", backgroundColor: darkMode ? "#2A2A2A" : "#F7F8FA" }]}>
            <Ionicons name="mail-outline" size={18} color="#888" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.inputField, { color: theme.text }]}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: roleColor }]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Preferences Card ── */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: darkMode ? "#333" : "#E8ECF4" }]}>
                <Ionicons name={darkMode ? "moon" : "sunny"} size={18} color={darkMode ? "#FFD54F" : "#FF8F00"} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Switch app appearance</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#E0E0E0", true: roleColor }}
              thumbColor={darkMode ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* ── Account Card ── */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Account</Text>

          {/* Account Info rows */}
          {[
            { icon: "shield-checkmark-outline", label: "Role", value: roleLabel, color: roleColor, bg: roleBg },
            { icon: "time-outline", label: "Session", value: "Active", color: "#2E7D32", bg: "#E8F5E9" },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={18} color="#B71C1C" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Hero */
  hero: {
    paddingTop: 52,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.7)",
  },
  avatarLoading: {
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  heroName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  heroEmail: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Scroll */
  scrollContent: {
    padding: 16,
  },

  /* Cards */
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 16,
  },

  /* Inputs */
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 2,
    color: "#666",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 14,
    gap: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },

  /* Save Button */
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  /* Settings row */
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  settingDesc: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 1,
  },

  /* Info rows */
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: "#aaa",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FFCDD2",
    backgroundColor: "#FFF5F5",
  },
  logoutText: {
    color: "#B71C1C",
    fontWeight: "bold",
    fontSize: 15,
  },
});
