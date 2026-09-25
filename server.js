require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointment");
const doctorRoutes = require("./routes/doctor");
const adminRoutes = require("./routes/admin");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // generous limit for development & mobile app usage
});

app.use(limiter);
app.get("/", (req, res) => {
  res.json({ message: "Mini OPD Backend is Running ✅" });
});

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;


const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins chat room (appointment based)
  socket.on("joinRoom", ({ appointmentId, userId }) => {
    socket.join(appointmentId);
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Send message
const Message = require("./models/Message");
const User = require("./models/User");
const Appointment = require("./models/Appointment");
const { sendPushNotification } = require("./utils/pushNotifications");

socket.on("sendMessage", async ({ appointmentId, message }) => {
  try {
    // Save to database then populate sender name
    const newMessage = await Message.create({
      appointment: appointmentId,
      sender: message.sender,
      text: message.text || "",
      image: message.image || "",
      fileUrl: message.fileUrl || "",
      fileName: message.fileName || "",
    });

    // Populate sender so frontend gets name + role
    const populated = await newMessage.populate("sender", "name role profileImage");

    // Emit populated message to all in room
    io.to(appointmentId).emit("receiveMessage", populated);

    // Send push notification to the other party
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        const senderId = message.sender;
        const recipientId =
          appointment.patient.toString() === senderId
            ? appointment.doctor.toString()
            : appointment.patient.toString();

        const recipient = await User.findById(recipientId);
        const sender = await User.findById(senderId);

        if (recipient?.pushToken) {
          // Only send push if recipient is NOT currently in the room
          const recipientSocketId = onlineUsers.get(recipientId);
          const roomSockets = io.sockets.adapter.rooms.get(appointmentId);
          const isInRoom = recipientSocketId && roomSockets?.has(recipientSocketId);

          if (!isInRoom) {
            let notificationBody = message.text || "";
            if (!notificationBody) {
              if (message.image) notificationBody = "📷 Sent an image";
              else if (message.fileName) notificationBody = `📎 Sent a file: ${message.fileName}`;
              else notificationBody = "📎 Sent an attachment";
            } else if (notificationBody.length > 100) {
              notificationBody = notificationBody.substring(0, 100) + "...";
            }

            await sendPushNotification(
              recipient.pushToken,
              `${sender?.name || "New Message"} 💬`,
              notificationBody,
              {
                screen: "Chat",
                appointmentId,
                otherName: sender?.name || "",
                otherRole: sender?.role || "",
              }
            );
          }
        }
      }
    } catch (pushErr) {
      console.log("Chat push notification error (non-critical):", pushErr.message);
    }

  } catch (error) {
    console.error("Message save error:", error);
  }
});

  // Typing indicator
  socket.on("typing", ({ appointmentId, user }) => {
    socket.to(appointmentId).emit("userTyping", user);
  });

  socket.on("stopTyping", ({ appointmentId }) => {
    socket.to(appointmentId).emit("stopTyping");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    }

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});