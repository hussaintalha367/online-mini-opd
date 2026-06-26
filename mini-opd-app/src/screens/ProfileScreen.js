import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { updateProfile, uploadProfileImage } from "../services/api";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setImage(user.profileImage);
    }
  };

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await updateProfile(token, { name, email });
      Alert.alert("Success ✅", "Profile Updated");
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    } catch {
      Alert.alert("Error ❌", "Update Failed");
    }
  };

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    const token = await AsyncStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", {
      uri: result.assets[0].uri,
      name: "profile.jpg",
      type: "image/jpeg",
    });

    try {
      const res = await uploadProfileImage(token, formData);
      setImage(res.data.url);
      Alert.alert("Success ✅", "Image Updated");
    } catch {
      Alert.alert("Upload Failed ❌");
    }
  };

  return (
    <View style={styles.container}>
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

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={{ color: "#fff" }}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F4F6F7"
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15
  },
  button: {
    backgroundColor: "#2E86C1",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center"
  }
});