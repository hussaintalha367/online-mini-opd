import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import { getMessages } from "../services/api";
import { io } from "socket.io-client";

const socket = io("https://online-mini-opd-production.up.railway.app");

export default function ChatScreen({ route }) {
  const { appointmentId } = route.params;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [typingUser, setTypingUser] = useState(null);

  const scrollViewRef = useRef();

  // ✅ Load user and join socket room
  useEffect(() => {
    const initializeChat = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);

      // ✅ Join appointment room
      socket.emit("joinRoom", {
        appointmentId,
        userId: payload.id
      });

      // ✅ Load old messages from DB
      const res = await getMessages(token, appointmentId);
      setMessages(res.data);
    };

    initializeChat();
  }, []);

  // ✅ Socket listeners
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("userTyping", (user) => {
      setTypingUser(user);
    });

    socket.on("stopTyping", () => {
      setTypingUser(null);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("stopTyping");
    };
  }, []);

  // ✅ Send message
  const handleSend = () => {
    if (!text.trim()) return;

    const messageData = {
      sender: userId,
      text: text
    };

    socket.emit("sendMessage", {
      appointmentId,
      message: messageData
    });

    setText("");
  };

  // ✅ Typing handler
  const handleTyping = (value) => {
    setText(value);

    socket.emit("typing", {
      appointmentId,
      user: userId
    });

    setTimeout(() => {
      socket.emit("stopTyping", { appointmentId });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, index) => {
          const isMine = msg.sender === userId;

          return (
            <View
              key={index}
              style={[
                styles.messageBubble,
                isMine ? styles.myMessage : styles.otherMessage
              ]}
            >
              <Text style={{ color: isMine ? "#fff" : "#000" }}>
                {msg.text}
              </Text>
            </View>
          );
        })}

        {typingUser && typingUser !== userId && (
          <Text style={styles.typingText}>User is typing...</Text>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type message..."
          value={text}
          onChangeText={handleTyping}
          style={styles.input}
        />

        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#b1e7f4",
    flex: 1,
    padding: 10
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "75%"
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2a9dd6"
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ddd"
  },
  typingText: {
    fontStyle: "italic",
    marginLeft: 10,
    marginBottom: 5
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: 10
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#13cbec",
    borderRadius: 20,
    paddingHorizontal: 15
  },
  sendButton: {
    backgroundColor: "#2a9dd6",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 20,
    marginLeft: 8
  }
});