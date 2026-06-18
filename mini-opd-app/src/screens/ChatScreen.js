import {decode as atob} from "base-64";
import React, { useEffect, useState, useRef} from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../utils/colors";
import { getMessages, sendMessage } from "../services/api";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function ChatScreen({ route }) {

  const { appointmentId } = route.params;
  const { theme } = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");


  const scrollViewRef = useRef();

  // ✅ Load user ID from token
  useEffect(() => {
    loadUser();
    loadMessages();
  }, []);

  const loadUser = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    setUserId(payload.id);
  };

  // ✅ Load chat messages
  const loadMessages = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await getMessages(token, appointmentId);
    setMessages(res.data);
  };

  // ✅ Send message
  const handleSend = async () => {
    if (!text.trim()) return;

    const token = await AsyncStorage.getItem("token");

    await sendMessage(token, appointmentId, text);

    setText("");
    loadMessages();
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

      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type message..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />

        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={{ color: "#0f0f16" }}>Send</Text>
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
    backgroundColor: "#939097",
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "75%"
  },
  myMessage: {
    alignSelf: "flex-end"
  },
  otherMessage: {
    alignSelf: "flex-start"
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