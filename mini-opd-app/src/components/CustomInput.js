import React from "react";
import { TextInput, StyleSheet } from "react-native";
import Colors from "../utils/colors";

export default function CustomInput(props) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor={Colors.gray}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 15
  }
});