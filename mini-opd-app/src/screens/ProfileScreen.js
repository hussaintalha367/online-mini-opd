import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { updateProfile, uploadProfileImage } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";

export default function ProfileScreen({ setRole }) {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setImage(user.profileImage || "");
    }
  };

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await updateProfile(token, { name, email });

      Alert.alert("Success ✅", "Profile Updated");

      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (error) {
      Alert.alert("Error ❌", "Update Failed");
    }
  };

  const handleImageUpload = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

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

    const localUri = result.assets[0].uri;
    const filename = localUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const formData = new FormData();
    formData.append("file", {
      uri: localUri,
      name: filename,
      type,
    });

    try {
      const res = await uploadProfileImage(token, formData);
      setImage(res.data.url);

      // ✅ Update stored user
     try {
  const res = await uploadProfileImage(token, formData);

  setImage(res.data.url);

  const storedUserRaw = await AsyncStorage.getItem("user");

  if (storedUserRaw) {
    const storedUser = JSON.parse(storedUserRaw);
    storedUser.profileImage = res.data.url;
    await AsyncStorage.setItem("user", JSON.stringify(storedUser));
  }

  Alert.alert("Success ✅", "Profile Image Updated");
} catch (error) {
  console.log(error.response || error);
  Alert.alert("Upload Failed ❌");
}

      Alert.alert("Success ✅", "Profile Image Updated");
    } catch (error) {
      console.log(error.response || error);
      Alert.alert("Upload Failed ❌");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setRole(null); // ✅ This triggers login screen automatically
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background }
      ]}
    >
      {/* ✅ Avatar */}
      <TouchableOpacity onPress={handleImageUpload}>
        <Image
          source={
            image
              ? { uri: image }
              : require("../../assets/profile.png")
          }
          style={styles.avatar}
        />
      </TouchableOpacity>

      <Text style={[styles.username, { color: theme.text }]}>
        {name || "User"}
      </Text>

      {/* ✅ Inputs */}
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor="#999"
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: "#ddd"
          }
        ]}
      />

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#999"
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: "#ddd"
          }
        ]}
      />

      {/* ✅ Save Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* ✅ Dark Mode Toggle */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.secondary }]}
        onPress={toggleTheme}
      >
        <Text style={styles.buttonText}>
          {darkMode ? "Switch to Light Mode ☀️" : "Switch to Dark Mode 🌙"}
        </Text>
      </TouchableOpacity>

      {/* ✅ Logout Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.danger }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center"
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 10
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20
  },
  input: {
    width: "100%",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 15
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});