import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../utils/colors";

export default function SplashScreen({ navigation }) {

  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login");
    }, 2500); // 2.5 seconds
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Online Mini OPD</Text>
      <Text style={styles.subtitle}>Healthcare Simplified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff"
  },
  subtitle: {
    marginTop: 10,
    color: "#fff",
    opacity: 0.8
  }
});