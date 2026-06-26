import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Colors from "../utils/colors";

export default function CustomButton({ title, onPress, color }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color || Colors.primary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
  backgroundColor: "#2E86C1",
  padding: 12,
  borderRadius: 10,
  marginVertical: 5,
  alignItems: "center",
},
text: {
  color: "#fff",
  fontWeight: "bold",
},
});

export { };