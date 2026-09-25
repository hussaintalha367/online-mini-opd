import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const STATUS_MESSAGES = [
  "Initializing Clinical Portal...",
  "Loading Doctor Registry & OPD Slots...",
  "Syncing Real-Time Consultations...",
  "Preparing Patient Care Experience...",
];

export default function SplashScreen() {
  const [statusIndex, setStatusIndex] = useState(0);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const textSlide = useRef(new Animated.Value(25)).current;

  // Pulse rings for vital signs / heartbeat
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.6)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.4)).current;

  // Orbit rotation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Heartbeat pulse for central icon
  const heartbeatAnim = useRef(new Animated.Value(1)).current;

  // Progress sweep
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Three bouncing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(textSlide, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Orbit Rotation
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();

    // 3. Heartbeat animation on medical badge
    const heartbeatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatAnim, {
          toValue: 1.08,
          duration: 160,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1.05,
          duration: 140,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(600),
      ])
    );
    heartbeatLoop.start();

    // 4. Expanding Pulse Rings (Vital Sign radar)
    const ring1Loop = Animated.loop(
      Animated.parallel([
        Animated.timing(ring1Scale, {
          toValue: 1.65,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ring1Opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const ring2Loop = Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 1.75,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    ring1Loop.start();
    ring2Loop.start();

    // 5. Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2800,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // 6. Bouncing vital dots loop
    const createDotAnim = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -8,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay),
        ])
      );

    const dot1Loop = createDotAnim(dot1, 0);
    const dot2Loop = createDotAnim(dot2, 150);
    const dot3Loop = createDotAnim(dot3, 300);

    dot1Loop.start();
    dot2Loop.start();
    dot3Loop.start();

    // Status message cycling
    const messageInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 900);

    return () => {
      rotateLoop.stop();
      heartbeatLoop.stop();
      ring1Loop.stop();
      ring2Loop.stop();
      dot1Loop.stop();
      dot2Loop.stop();
      dot3Loop.stop();
      clearInterval(messageInterval);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.65],
  });

  return (
    <LinearGradient colors={["#0D47A1", "#1565C0", "#00897B"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

      {/* Decorative ambient background circles */}
      <View style={styles.ambientCircleTop} />
      <View style={styles.ambientCircleBottom} />

      {/* Central Medical Emblem with Animated Radar / Vital Rings */}
      <View style={styles.emblemContainer}>
        {/* Outer Expanding Pulse Ring 2 */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: ring2Scale }],
              opacity: ring2Opacity,
            },
          ]}
        />

        {/* Outer Expanding Pulse Ring 1 */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: ring1Scale }],
              opacity: ring1Opacity,
            },
          ]}
        />

        {/* Orbiting Satellite Activity Ring */}
        <Animated.View
          style={[
            styles.orbitRing,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <View style={styles.orbitSatellite} />
          <View style={styles.orbitSatelliteSecondary} />
        </Animated.View>

        {/* Central Core Emblem with Heartbeat Pulse */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { scale: Animated.multiply(logoScale, heartbeatAnim) },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#29B6F6", "#0288D1", "#01579B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Ionicons name="medical" size={54} color="#fff" />
          </LinearGradient>
        </Animated.View>
      </View>

      {/* App Branding Titles */}
      <Animated.View
        style={[
          styles.textContainer,
          { opacity: fadeAnim, transform: [{ translateY: textSlide }] },
        ]}
      >
        <Text style={styles.appName}>Online Mini OPD</Text>
        <View style={styles.badgeRow}>
          <Ionicons name="pulse" size={14} color="#69F0AE" style={{ marginRight: 6 }} />
          <Text style={styles.tagline}>Smart Clinical Portal</Text>
        </View>
      </Animated.View>

      {/* Animated OPD Loader Section */}
      <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
        {/* Animated Progress Track */}
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
            <LinearGradient
              colors={["#69F0AE", "#00E676", "#00B0FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        {/* Status Message with Bouncing Vital Dots */}
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>{STATUS_MESSAGES[statusIndex]}</Text>
          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
          </View>
        </View>
      </Animated.View>

      {/* Bottom Footer Info */}
      <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
        <View style={styles.secureTag}>
          <Ionicons name="shield-checkmark" size={13} color="#80D8FF" style={{ marginRight: 5 }} />
          <Text style={styles.secureText}>HIPAA Compliant Healthcare System</Text>
        </View>
        <Text style={styles.version}>v2.0 • BSCS Final Year Project</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  ambientCircleTop: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  ambientCircleBottom: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(0, 230, 118, 0.04)",
  },
  emblemContainer: {
    width: 170,
    height: 170,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  pulseRing: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "rgba(105, 240, 174, 0.6)",
    backgroundColor: "rgba(105, 240, 174, 0.08)",
  },
  orbitRing: {
    position: "absolute",
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  orbitSatellite: {
    position: "absolute",
    top: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#69F0AE",
    shadowColor: "#69F0AE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  orbitSatelliteSecondary: {
    position: "absolute",
    bottom: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#80D8FF",
    shadowColor: "#80D8FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  iconWrapper: {
    zIndex: 10,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 36,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tagline: {
    fontSize: 12,
    color: "#E0F2F1",
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  loaderContainer: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30,
  },
  progressBarTrack: {
    width: width * 0.65,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statusText: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 24,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#69F0AE",
  },
  bottom: {
    position: "absolute",
    bottom: 34,
    alignItems: "center",
  },
  secureTag: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  secureText: {
    color: "#80D8FF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  version: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
