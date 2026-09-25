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
  Image,
  Modal,
  Alert,
  Linking,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import { io } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { getMessages, uploadChatAttachment, SOCKET_URL } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";

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
  return (
    d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) +
    "  " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
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
      groups.push({
        type: "divider",
        label: formatDateDivider(msg.createdAt),
        key: dateKey + Math.random(),
      });
      lastDate = dateKey;
    }
    groups.push({ type: "message", data: msg });
  });
  return groups;
}

export default function ChatScreen({ route, navigation }) {
  const { appointmentId, otherName, otherRole } = route.params;
  const { theme } = useContext(ThemeContext);

  const [messages, setMessages]       = useState([]);
  const [text, setText]               = useState("");
  const [userId, setUserId]           = useState("");
  const [userRole, setUserRole]       = useState("");
  const [typingUser, setTypingUser]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [connected, setConnected]     = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const scrollRef = useRef();
  const typingTimer = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
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
      setUserRole(payload.role);

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

  /* ── File & Image Upload Handlers ── */
  const uploadAndSend = async (uri, name, mimeType, isImage) => {
    setUploading(true);
    setUploadStatus(isImage ? "Uploading image..." : "Uploading file...");
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication", "Please log in again.");
        return;
      }

      const cleanFilename = name || uri.split("/").pop() || (isImage ? "photo.jpg" : "document.pdf");
      const match = /\.(\w+)$/.exec(cleanFilename);
      const ext = match ? match[1].toLowerCase() : (isImage ? "jpg" : "pdf");
      const fileType = mimeType || (isImage ? `image/${ext === "jpg" ? "jpeg" : ext}` : "application/pdf");

      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: cleanFilename,
        type: fileType,
      });

      const res = await uploadChatAttachment(token, appointmentId, formData);
      const { url, fileName } = res.data;

      if (socketRef.current) {
        socketRef.current.emit("sendMessage", {
          appointmentId,
          message: {
            sender: userId,
            text: text.trim(),
            image: isImage ? url : "",
            fileUrl: !isImage ? url : "",
            fileName: fileName || name,
          },
        });
        setText("");
        socketRef.current.emit("stopTyping", { appointmentId });
      }
    } catch (err) {
      console.error("Chat upload failed:", err);
      Alert.alert("Upload Error", "Failed to upload attachment. Please check your connection and try again.");
    } finally {
      setUploading(false);
      setUploadStatus("");
      setShowAttachMenu(false);
    }
  };

  const handlePickImage = async () => {
    setShowAttachMenu(false);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Please allow media library access to send images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename = asset.fileName || "photo.jpg";
        await uploadAndSend(asset.uri, filename, asset.mimeType || "image/jpeg", true);
      }
    } catch (err) {
      console.error("Gallery picker error:", err);
      Alert.alert("Error", "Could not pick image from gallery.");
    }
  };

  const handleTakePhoto = async () => {
    setShowAttachMenu(false);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Please allow camera access to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename = "camera_" + Date.now() + ".jpg";
        await uploadAndSend(asset.uri, filename, "image/jpeg", true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      Alert.alert("Error", "Could not capture photo.");
    }
  };

  const handlePickDocument = async () => {
    setShowAttachMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "text/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const isImg = asset.mimeType?.startsWith("image/") || false;
        await uploadAndSend(asset.uri, asset.name || "document.pdf", asset.mimeType || "application/pdf", isImg);
      }
    } catch (err) {
      console.error("Document picker error:", err);
      Alert.alert("Error", "Could not select document.");
    }
  };

  const openDocument = (url) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => {
      console.error("Open file error:", err);
      Alert.alert("Cannot Open", "Could not open document link.");
    });
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
            <Ionicons
              name={otherRole === "doctor" ? "medkit" : "person"}
              size={20}
              color="#fff"
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {otherName || "Appointment Chat"}
            </Text>
            <View style={styles.headerStatus}>
              <View style={[styles.onlineDot, { backgroundColor: connected ? "#69F0AE" : "#aaa" }]} />
              <Text style={styles.headerStatusText}>
                {connected ? "Online" : "Connecting..."}
              </Text>
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
                <Text style={styles.emptyChatSub}>Start the conversation or share documents below</Text>
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
              const senderId   = msg.sender?._id || msg.sender;
              const isMine     = senderId === userId;
              const senderName = isMine
                ? "You"
                : (msg.sender?.name || otherName || (otherRole === "doctor" ? "Doctor" : "Patient"));

              const hasImage = Boolean(msg.image);
              const hasFile  = Boolean(msg.fileUrl);
              const hasText  = Boolean(msg.text && msg.text.trim());

              return (
                <View
                  key={msg._id || idx}
                  style={[
                    styles.bubbleWrapper,
                    isMine ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                  ]}
                >
                  {!isMine && (
                    <View style={styles.msgAvatar}>
                      <Ionicons name="person" size={14} color="#fff" />
                    </View>
                  )}

                  <View style={[styles.bubbleCol, isMine && { alignItems: "flex-end" }]}>
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
                        hasImage && styles.imageBubblePadding,
                      ]}
                    >
                      {/* Image Attachment */}
                      {hasImage && (
                        <TouchableOpacity
                          activeOpacity={0.9}
                          onPress={() => setPreviewImage(msg.image)}
                          style={styles.imageContainer}
                        >
                          <Image
                            source={{ uri: msg.image }}
                            style={styles.chatImage}
                            resizeMode="cover"
                          />
                          <View style={styles.imageZoomBadge}>
                            <Ionicons name="scan-outline" size={14} color="#fff" />
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* File / Document Attachment */}
                      {hasFile && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => openDocument(msg.fileUrl)}
                          style={[
                            styles.fileContainer,
                            isMine ? styles.fileContainerMine : styles.fileContainerTheirs,
                          ]}
                        >
                          <View style={styles.fileIconBox}>
                            <Ionicons
                              name={
                                msg.fileName?.toLowerCase().endsWith(".pdf")
                                  ? "document-text"
                                  : "attach"
                              }
                              size={22}
                              color="#1565C0"
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.fileNameText,
                                { color: isMine ? "#fff" : "#1A1A2E" },
                              ]}
                              numberOfLines={1}
                            >
                              {msg.fileName || "Shared Document"}
                            </Text>
                            <Text
                              style={[
                                styles.fileTapText,
                                { color: isMine ? "rgba(255,255,255,0.7)" : "#78909C" },
                              ]}
                            >
                              Tap to open
                            </Text>
                          </View>
                          <Ionicons
                            name="arrow-down-circle-outline"
                            size={20}
                            color={isMine ? "#fff" : "#1565C0"}
                          />
                        </TouchableOpacity>
                      )}

                      {/* Text Message */}
                      {hasText && (
                        <Text style={[styles.msgText, isMine ? styles.myText : styles.theirText]}>
                          {msg.text}
                        </Text>
                      )}

                      {/* Timestamp & Read Tick */}
                      <View style={styles.msgMeta}>
                        <Text
                          style={[
                            styles.msgTime,
                            { color: isMine ? "rgba(255,255,255,0.7)" : "#888" },
                          ]}
                        >
                          {formatTime(msg.createdAt)}
                        </Text>
                        {isMine && (
                          <Ionicons
                            name="checkmark-done"
                            size={13}
                            color="rgba(255,255,255,0.75)"
                          />
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

          {/* ── Uploading Banner ── */}
          {uploading && (
            <View style={styles.uploadingBanner}>
              <ActivityIndicator size="small" color="#1565C0" />
              <Text style={styles.uploadingText}>{uploadStatus || "Uploading..."}</Text>
            </View>
          )}

          {/* ── Attachment Menu Popup ── */}
          {showAttachMenu && (
            <View style={[styles.attachMenu, { backgroundColor: theme.card }]}>
              <TouchableOpacity
                style={styles.attachOption}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: "#E91E63" }]}>
                  <Ionicons name="camera" size={22} color="#fff" />
                </View>
                <Text style={[styles.attachOptionText, { color: theme.text }]}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachOption}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: "#9C27B0" }]}>
                  <Ionicons name="images" size={22} color="#fff" />
                </View>
                <Text style={[styles.attachOptionText, { color: theme.text }]}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachOption}
                onPress={handlePickDocument}
                activeOpacity={0.7}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: "#0288D1" }]}>
                  <Ionicons name="document-text" size={22} color="#fff" />
                </View>
                <Text style={[styles.attachOptionText, { color: theme.text }]}>Document</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Input Bar ── */}
          <View style={[styles.inputBar, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[
                styles.attachBtn,
                showAttachMenu && { backgroundColor: "#E3F2FD" },
              ]}
              onPress={() => setShowAttachMenu((prev) => !prev)}
              activeOpacity={0.7}
              disabled={uploading}
            >
              <Ionicons
                name={showAttachMenu ? "close" : "attach"}
                size={24}
                color={showAttachMenu ? "#1565C0" : "#607D8B"}
              />
            </TouchableOpacity>

            <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#aaa"
                value={text}
                onChangeText={handleTyping}
                style={[styles.input, { color: theme.text }]}
                multiline
                maxLength={500}
                editable={!uploading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: text.trim() && !uploading ? "#1565C0" : "#B0BEC5" },
              ]}
              onPress={handleSend}
              disabled={!text.trim() || uploading}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ── Fullscreen Image Preview Modal ── */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPreviewImage(null)}
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => previewImage && openDocument(previewImage)}
            >
              <Ionicons name="open-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  headerStatus: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  headerStatusText: { color: "rgba(255,255,255,0.8)", fontSize: 12 },

  /* Messages */
  messageList: { padding: 16, paddingBottom: 8 },
  emptyChat: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyChatText: { fontSize: 18, fontWeight: "bold", color: "#aaa" },
  emptyChatSub: { color: "#ccc", fontSize: 13, textAlign: "center" },

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
  bubbleWrapper: { flexDirection: "row", marginVertical: 4, alignItems: "flex-end", gap: 6 },
  bubbleWrapperRight: { justifyContent: "flex-end" },
  bubbleWrapperLeft: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#90A4AE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  bubbleCol: {
    maxWidth: "80%",
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
    borderRadius: 18,
  },
  imageBubblePadding: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 8,
  },
  myBubble: {
    backgroundColor: "#1565C0",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#ECEFF1",
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: 15, lineHeight: 21, marginTop: 4 },
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

  /* Image Attachment Inside Bubble */
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#263238",
  },
  chatImage: {
    width: 220,
    height: 180,
    borderRadius: 12,
  },
  imageZoomBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    padding: 4,
  },

  /* File Attachment Inside Bubble */
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    gap: 10,
    minWidth: 200,
    maxWidth: 240,
  },
  fileContainerMine: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  fileContainerTheirs: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
  },
  fileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: "700",
  },
  fileTapText: {
    fontSize: 11,
    marginTop: 2,
  },

  /* Typing bubble */
  typingBubble: { paddingVertical: 14 },
  typingDots: { flexDirection: "row", gap: 4 },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#90A4AE",
  },

  /* Uploading Banner */
  uploadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    backgroundColor: "#E3F2FD",
    borderTopWidth: 1,
    borderTopColor: "#BBDEFB",
  },
  uploadingText: {
    fontSize: 13,
    color: "#1565C0",
    fontWeight: "600",
  },

  /* Attachment Menu Popup */
  attachMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ECEFF1",
    elevation: 8,
  },
  attachOption: {
    alignItems: "center",
    gap: 6,
  },
  attachIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  attachOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /* Input Bar */
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#ECEFF1",
    elevation: 6,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    marginBottom: 2,
  },

  /* Fullscreen Image Modal */
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "92%",
    height: "75%",
  },
});
