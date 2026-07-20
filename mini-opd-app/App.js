import React, { useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import PatientDashboard from "./src/screens/PatientDashboard";
import DoctorDashboard from "./src/screens/DoctorDashboard";
import AdminDashboard from "./src/screens/AdminDashboard";
import DoctorsScreen from "./src/screens/DoctorsScreen";
import AppointmentsScreen from "./src/screens/AppointmentsScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import DoctorDetailsScreen from "./src/screens/DoctorDetailsScreen";
import Loader from "./src/components/Loader";

import { ThemeProvider } from "./src/context/ThemeContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* Tab bar style shared across both roles */
const TAB_OPTIONS = (route) => ({
  headerShown: false,
  tabBarActiveTintColor: "#1565C0",
  tabBarInactiveTintColor: "#90A4AE",
  tabBarStyle: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF4",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
});

/* ── PATIENT TABS ── */
function PatientTabs({ setRole }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientMain">
        {() => (
          <Tab.Navigator screenOptions={({ route }) => TAB_OPTIONS(route)}>
            <Tab.Screen
              name="Home"
              component={PatientDashboard}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home-outline" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Doctors"
              component={DoctorsScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="medkit-outline" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Appointments"
              component={AppointmentsScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="calendar-outline" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person-outline" size={size} color={color} />
                ),
              }}
            >
              {(props) => <ProfileScreen {...props} setRole={setRole} />}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </Stack.Screen>

      <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

/* ── DOCTOR TABS ── */
function DoctorTabs({ setRole }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorMain">
        {() => (
          <Tab.Navigator screenOptions={({ route }) => TAB_OPTIONS(route)}>
            <Tab.Screen
              name="Home"
              component={DoctorDashboard}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home-outline" size={size} color={color} />
                ),
              }}
            >
              {(props) => <DoctorDashboard {...props} setRole={setRole} />}
            </Tab.Screen>
            <Tab.Screen
              name="Appointments"
              component={AppointmentsScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="calendar-outline" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person-outline" size={size} color={color} />
                ),
              }}
            >
              {(props) => <ProfileScreen {...props} setRole={setRole} />}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </Stack.Screen>

      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

/* ── MAIN APP ── */
export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      checkUser();
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  const checkUser = async () => {
    try {
      const savedRole = await AsyncStorage.getItem("role");
      if (savedRole) setRole(savedRole);
    } catch (_) {}
    setLoading(false);
  };

  if (showSplash) {
    return (
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    );
  }

  if (loading) {
    return <Loader message="Starting up..." />;
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {/* Auth */}
          {role === null && (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} setRole={setRole} />}
              </Stack.Screen>
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}

          {/* Patient */}
          {role === "patient" && (
            <Stack.Screen name="PatientHome">
              {(props) => <PatientTabs {...props} setRole={setRole} />}
            </Stack.Screen>
          )}

          {/* Doctor */}
          {role === "doctor" && (
            <Stack.Screen name="DoctorHome">
              {(props) => <DoctorTabs {...props} setRole={setRole} />}
            </Stack.Screen>
          )}

          {/* Admin */}
          {role === "admin" && (
            <Stack.Screen name="AdminDashboard">
              {(props) => <AdminDashboard {...props} setRole={setRole} />}
            </Stack.Screen>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
