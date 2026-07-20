import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#1565C0", "#0288D1", "#26A69A"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Icon + Logo */}
      <Animated.View
        style={[
          styles.iconWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="medical" size={54} color="#fff" />
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <Text style={styles.appName}>Online Mini OPD</Text>
        <Text style={styles.tagline}>Healthcare Simplified</Text>
      </Animated.View>

      {/* Bottom Version */}
      <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
        <Text style={styles.version}>v1.0.0 • Final Year Project</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 28,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  bottom: {
    position: "absolute",
    bottom: 40,
  },
  version: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
});
