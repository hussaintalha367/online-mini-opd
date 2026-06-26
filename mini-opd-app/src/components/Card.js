import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "../utils/colors";

export default function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
   card: {
  backgroundColor: "#fff",
  padding: 16,
  borderRadius: 15,
  marginBottom: 15,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
},
});