import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
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

import Colors from "./src/utils/colors";
import { ThemeProvider } from "./src/context/ThemeContext";
import DoctorDetailsScreen from "./src/screens/DoctorDetailsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ✅ PATIENT TABS */
function PatientTabs({ setRole }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientMain">
        {() => (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: Colors.primary,
              tabBarIcon: ({ color, size }) => {
                let iconName;

                if (route.name === "Doctors") {
                  iconName = "medkit";
                } else if (route.name === "Appointments") {
                  iconName = "calendar";
                } else if (route.name === "Profile") {
                  iconName = "person";
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              }
            })}
          >
            <Tab.Screen name="Doctors" component={DoctorsScreen} />
            <Tab.Screen name="Appointments" component={AppointmentsScreen} />
            <Tab.Screen name="Profile">
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

/* ✅ DOCTOR TABS */
function DoctorTabs({ setRole }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorMain">
        {() => (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: Colors.primary,
              tabBarIcon: ({ color, size }) => {
                let iconName;

                if (route.name === "Appointments") {
                  iconName = "calendar";
                } else if (route.name === "Profile") {
                  iconName = "person";
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              }
            })}
          >
            <Tab.Screen name="Appointments" component={AppointmentsScreen} />
            <Tab.Screen name="Profile">
              {(props) => <ProfileScreen {...props} setRole={setRole} />}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </Stack.Screen>

      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

/* ✅ MAIN APP */
export default function App() {

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
      checkUser();
    }, 2500);
  }, []);

  const checkUser = async () => {
    const savedRole = await AsyncStorage.getItem("role");
    if (savedRole) setRole(savedRole);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>

        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {/* ✅ Splash */}
          {showSplash && (
            <Stack.Screen name="Splash" component={SplashScreen} />
          )}

          {/* ✅ Auth Screens */}
          {!showSplash && role === null && (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} setRole={setRole} />}
              </Stack.Screen>
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}

          {/* ✅ Patient Area */}
          {!showSplash && role === "patient" && (
            <Stack.Screen name="PatientHome">
              {(props) => <PatientTabs {...props} setRole={setRole} />}
            </Stack.Screen>
          )}

          {/* ✅ Doctor Area */}
          {!showSplash && role === "doctor" && (
            <Stack.Screen name="DoctorHome">
              {(props) => <DoctorTabs {...props} setRole={setRole} />}
            </Stack.Screen>
          )}

          {/* ✅ Admin Area */}
          {!showSplash && role === "admin" && (
            <Stack.Screen name="AdminDashboard">
              {(props) => <AdminDashboard {...props} setRole={setRole} />}
            </Stack.Screen>
          )}

        </Stack.Navigator>

      </NavigationContainer>
    </ThemeProvider>
  );
}