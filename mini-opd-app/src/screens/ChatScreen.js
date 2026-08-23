import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import { io } from "socket.io-client";
import { getMessages, SOCKET_URL } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";

// Socket is created INSIDE the component (via useRef) so it reconnects properly each time

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFullDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) +
    "  " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt);
    const dateKey = isNaN(d) ? "Unknown" : d.toDateString();
    if (dateKey !== lastDate) {
      groups.push({ type: "divider", label: formatDateDivider(msg.createdAt), key: dateKey + Math.random() });
      lastDate = dateKey;
    }
    groups.push({ type: "message", data: msg });
  });
  return groups;
}

export default function ChatScreen({ route, navigation }) {
  const { appointmentId } = route.params;
  const { theme } = useContext(ThemeContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const scrollRef = useRef();
  const typingTimer = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection when screen mounts
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on("userTyping", (user) => {
      setTypingUser(user);
    });
    socket.on("stopTyping", () => {
      setTypingUser(null);
    });

    initializeChat();

    return () => {
      // Cleanup on unmount
      if (typingTimer.current) clearTimeout(typingTimer.current);
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("stopTyping");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, []);

  const initializeChat = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);

      socketRef.current.emit("joinRoom", { appointmentId, userId: payload.id });

      const res = await getMessages(token, appointmentId);
      setMessages(res.data || []);
    } catch (e) {
      console.log("Chat init error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", {
      appointmentId,
      message: { sender: userId, text: text.trim() },
    });
    setText("");
    socketRef.current.emit("stopTyping", { appointmentId });
  };

  const handleTyping = (val) => {
    setText(val);
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { appointmentId, user: userId });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", { appointmentId });
    }, 1200);
  };

  const grouped = groupByDate(messages);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0288D1" />

      {/* ── Header ── */}
      <LinearGradient colors={["#1565C0", "#0288D1"]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Ionicons name="medical" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Appointment Chat</Text>
            <View style={styles.headerStatus}>
              <View style={[styles.onlineDot, { backgroundColor: connected ? "#69F0AE" : "#aaa" }]} />
              <Text style={styles.headerStatusText}>{connected ? "Online" : "Connecting..."}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* ── Messages ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0288D1" />
          <Text style={{ color: "#888", marginTop: 10 }}>Loading messages...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollRef}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 && (
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={52} color="#ccc" />
                <Text style={styles.emptyChatText}>No messages yet</Text>
                <Text style={styles.emptyChatSub}>Start the conversation below</Text>
              </View>
            )}

            {grouped.map((item, idx) => {
              if (item.type === "divider") {
                return (
                  <View key={item.key} style={styles.dateDivider}>
                    <View style={styles.dateDividerLine} />
                    <Text style={styles.dateDividerText}>{item.label}</Text>
                    <View style={styles.dateDividerLine} />
                  </View>
                );
              }

              const msg = item.data;
              const isMine = msg.sender?._id === userId || msg.sender === userId;
              const senderName = isMine
                ? "You"
                : msg.sender?.name || (msg.sender?.role === "doctor" ? "Doctor" : "Patient");

              return (
                <View
                  key={idx}
                  style={[
                    styles.bubbleWrapper,
                    isMine ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                  ]}
                >
                  {/* Avatar for other person */}
                  {!isMine && (
                    <View style={styles.msgAvatar}>
                      <Ionicons name="person" size={14} color="#fff" />
                    </View>
                  )}

                  <View style={[styles.bubbleCol, isMine && { alignItems: "flex-end" }]}>
                    {/* Sender name + date above bubble */}
                    <View style={[styles.msgHeader, isMine && { flexDirection: "row-reverse" }]}>
                      <Text style={styles.msgSenderName}>{senderName}</Text>
                      <Text style={styles.msgHeaderDate}>
                        {formatFullDateTime(msg.createdAt)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.bubble,
                        isMine ? styles.myBubble : styles.theirBubble,
                      ]}
                    >
                      <Text style={[styles.msgText, isMine ? styles.myText : styles.theirText]}>
                        {msg.text}
                      </Text>
                      <View style={styles.msgMeta}>
                        <Text style={[styles.msgTime, { color: isMine ? "rgba(255,255,255,0.65)" : "#aaa" }]}>
                          {formatTime(msg.createdAt)}
                        </Text>
                        {isMine && (
                          <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.65)" />
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Typing indicator */}
            {typingUser && typingUser !== userId && (
              <View style={[styles.bubbleWrapperLeft, styles.bubbleWrapper]}>
                <View style={styles.msgAvatar}>
                  <Ionicons name="person" size={14} color="#fff" />
                </View>
                <View style={[styles.bubble, styles.theirBubble, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={styles.typingDot} />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* ── Input Bar ── */}
          <View style={[styles.inputBar, { backgroundColor: theme.card }]}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#aaa"
                value={text}
                onChangeText={handleTyping}
                style={[styles.input, { color: theme.text }]}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: text.trim() ? "#1565C0" : "#ccc" }]}
              onPress={handleSend}
              disabled={!text.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* Header */
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 8,
  },
  headerInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  headerStatus: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  headerStatusText: { color: "rgba(255,255,255,0.8)", fontSize: 12 },

  /* Messages */
  messageList: { padding: 16, paddingBottom: 8 },
  emptyChat: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyChatText: { fontSize: 18, fontWeight: "bold", color: "#aaa" },
  emptyChatSub: { color: "#ccc", fontSize: 13 },

  /* Date Divider */
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  dateDividerLine: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  dateDividerText: {
    fontSize: 12,
    color: "#aaa",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },

  /* Bubbles */
  bubbleWrapper: { flexDirection: "row", marginVertical: 3, alignItems: "flex-end", gap: 6 },
  bubbleWrapperRight: { justifyContent: "flex-end" },
  bubbleWrapperLeft: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#90A4AE",
    justifyContent: "center", alignItems: "center",
    marginBottom: 4,
  },
  bubbleCol: {
    maxWidth: "75%",
    alignItems: "flex-start",
  },
  msgHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  msgSenderName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
  },
  msgHeaderDate: {
    fontSize: 10,
    color: "#aaa",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: "#1565C0",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#ECEFF1",
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: 15, lineHeight: 21 },
  myText: { color: "#fff" },
  theirText: { color: "#1A1A2E" },
  msgMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    justifyContent: "flex-end",
  },
  msgTime: { fontSize: 11 },

  /* Typing bubble */
  typingBubble: { paddingVertical: 14 },
  typingDots: { flexDirection: "row", gap: 4 },
  typingDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: "#90A4AE",
  },

  /* Input Bar */
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#ECEFF1",
    elevation: 6,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
  },
  input: { fontSize: 15, lineHeight: 20 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});
