import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { getAppointmentStats, getMyAppointments } from "../services/api";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [appointmentBadge, setAppointmentBadge] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef(null);

  const fetchBadges = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      if (!token || !role) return;

      // Fetch appointment stats for badge
      const statsRes = await getAppointmentStats(token);
      const stats = statsRes.data;

      if (role === "doctor") {
        // Doctors see pending requests that need attention
        setAppointmentBadge(stats.pending || 0);
      } else if (role === "patient") {
        // Patients see pending + approved (upcoming) appointments
        setAppointmentBadge(stats.pending || 0);
      }

      // Fetch unread chat count
      // We'll count appointments that have the "approved" status
      // (active chats that might have messages)
      const appointmentsRes = await getMyAppointments(token);
      const appointments = appointmentsRes.data || [];
      const activeChats = appointments.filter(
        (a) => a.status === "approved" || a.status === "pending"
      ).length;
      // For now, we don't track read/unread per message,
      // so we won't show chat badge (would need backend support)
      // setUnreadChats(0);
    } catch (err) {
      // Silently fail — badges are not critical
    }
  }, []);

  // Auto-refresh badges every 30 seconds when app is active
  useEffect(() => {
    fetchBadges();

    intervalRef.current = setInterval(fetchBadges, 30000);

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        // App came to foreground — refresh immediately
        fetchBadges();
      }
      appState.current = nextState;
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription?.remove();
    };
  }, [fetchBadges]);

  return (
    <NotificationContext.Provider
      value={{
        appointmentBadge,
        unreadChats,
        refreshBadges: fetchBadges,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
