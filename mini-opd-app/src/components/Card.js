import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "../utils/colors";

export default function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 5,
  },
});