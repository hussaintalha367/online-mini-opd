# Online Mini OPD — Complete Project Documentation

> **Final Year Project** | BS Computer Science
> **Project Title:** Online Mini OPD (Out-Patient Department) System
> **Stack:** Node.js · Express · MongoDB · React Native (Expo) · React.js · Socket.io · Cloudinary

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Design (ER Diagram)](#4-database-design-er-diagram)
5. [Use Case Diagram](#5-use-case-diagram)
6. [Data Flow Diagram (DFD)](#6-data-flow-diagram-dfd)
7. [Sequence Diagrams](#7-sequence-diagrams)
8. [Component / Module Diagram](#8-component--module-diagram)
9. [API Reference](#9-api-reference)
10. [Mobile App Screens & Navigation](#10-mobile-app-screens--navigation)
11. [Admin Panel](#11-admin-panel)
12. [Real-Time Chat (Socket.io)](#12-real-time-chat-socketio)
13. [Security Implementation](#13-security-implementation)
14. [Setup & Installation Guide](#14-setup--installation-guide)
15. [Project Folder Structure](#15-project-folder-structure)
16. [Key Features Summary](#16-key-features-summary)
17. [Future Enhancements](#17-future-enhancements)

---

## 1. Project Overview

### Problem Statement
In Pakistan and many developing countries, patients face significant difficulties in accessing doctors. Long queues, travel costs, and lack of appointment systems make healthcare inefficient. There is a need for a digital platform that connects patients with doctors seamlessly.

### Solution
**Online Mini OPD** is a full-stack telemedicine platform that allows:
- Patients to find doctors, book appointments, chat in real-time, and receive digital prescriptions.
- Doctors to manage appointments, consult patients via chat, and upload prescriptions.
- Admins to monitor the entire platform, manage users, and view system analytics.

### Project Scope
| Feature | Status |
|---------|--------|
| User Registration & Login (JWT Auth) | ✅ Complete |
| Role-based Access (Patient / Doctor / Admin) | ✅ Complete |
| Doctor Listing with Search & Filter | ✅ Complete |
| Appointment Booking with Date/Time Picker | ✅ Complete |
| Appointment Status Management | ✅ Complete |
| Real-time Chat (Socket.io) | ✅ Complete |
| Prescription Upload (Cloudinary) | ✅ Complete |
| Profile Image Upload (Cloudinary) | ✅ Complete |
| Admin Dashboard with Analytics | ✅ Complete |
| Dark Mode | ✅ Complete |
| Rate Limiting & Security Headers | ✅ Complete |

---

## 2. System Architecture

The system follows a **3-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                        │
│                                                                 │
│   ┌──────────────────────────┐   ┌─────────────────────────┐   │
│   │  React Native Mobile App │   │  React.js Admin Panel   │   │
│   │  (Expo — iOS & Android)  │   │  (Web Browser)          │   │
│   └──────────────┬───────────┘   └──────────┬──────────────┘   │
└──────────────────┼──────────────────────────┼──────────────────┘
                   │  HTTP/REST + Socket.io    │  HTTP/REST
                   ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION TIER                         │
│                                                                 │
│   ┌────────────────────────────────────────────────────────┐   │
│   │              Node.js + Express.js Backend              │   │
│   │                                                        │   │
│   │  Routes: /api/auth  /api/appointments                  │   │
│   │          /api/doctors  /api/admin                      │   │
│   │                                                        │   │
│   │  Middleware: JWT Auth | Role Guard | Rate Limiter      │   │
│   │             Helmet | CORS | Morgan                     │   │
│   │                                                        │   │
│   │  Socket.io Server (Real-time Chat)                     │   │
│   └──────────┬──────────────────────────┬──────────────────┘   │
└──────────────┼──────────────────────────┼──────────────────────┘
               │  Mongoose ODM            │  Cloudinary SDK
               ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│       DATA TIER          │   │      CLOUD STORAGE           │
│                          │   │                              │
│   MongoDB Atlas          │   │   Cloudinary                 │
│   (Cloud Database)       │   │   - Profile Images           │
│                          │   │   - Prescription Files       │
│   Collections:           │   │     (JPG, PNG, PDF)          │
│   - users                │   └──────────────────────────────┘
│   - appointments         │
│   - messages             │
└──────────────────────────┘
```

---

## 3. Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | v18+ | JavaScript runtime |
| Express.js | v4.x | Web framework, REST API |
| MongoDB | Atlas | NoSQL database |
| Mongoose | v7.x | MongoDB ODM |
| Socket.io | v4.x | Real-time bidirectional communication |
| JSON Web Token (JWT) | v9.x | Authentication tokens |
| bcryptjs | v2.x | Password hashing |
| Joi | v17.x | Request validation |
| Multer | v1.x | File upload handling |
| multer-storage-cloudinary | v4.x | Direct Cloudinary upload |
| Cloudinary | v2.x | Cloud media storage |
| Helmet | v7.x | HTTP security headers |
| express-rate-limit | v7.x | Rate limiting (DDoS protection) |
| Morgan | v1.x | HTTP request logging |
| dotenv | v16.x | Environment variable management |
| cors | v2.x | Cross-Origin Resource Sharing |

### Mobile App (React Native)
| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | v0.73+ | Cross-platform mobile framework |
| Expo | v50+ | Development & build toolchain |
| React Navigation | v6.x | Screen navigation |
| AsyncStorage | v1.x | Local persistent storage |
| Axios | v1.x | HTTP client |
| Socket.io Client | v4.x | Real-time chat connection |
| expo-image-picker | v14.x | Camera & gallery access |
| expo-linear-gradient | v12.x | Gradient UI elements |
| @expo/vector-icons (Ionicons) | v13.x | Icon library |
| @react-native-community/datetimepicker | v7.x | Date/time selection |
| base-64 | v1.x | JWT token decoding |

### Admin Panel (React.js)
| Technology | Version | Purpose |
|-----------|---------|---------|
| React.js | v18.x | UI framework |
| Material UI (MUI) | v5.x | Component library |
| React Router | v6.x | Client-side routing |
| Axios | v1.x | HTTP client |

---

## 4. Database Design (ER Diagram)

### Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│              User                   │
├─────────────────────────────────────┤
│ _id          : ObjectId (PK)        │
│ name         : String               │
│ email        : String (unique)      │
│ password     : String (hashed)      │
│ role         : Enum[patient,        │
│                doctor, admin]       │
│ phone        : String               │
│ specialization : String             │
│ experience   : Number               │
│ profileImage : String (URL)         │
│ isBlocked    : Boolean (def: false) │
│ createdAt    : Date                 │
│ updatedAt    : Date                 │
└──────────┬──────────────────────────┘
           │ 1 (as patient)
           │ 1 (as doctor)
           │
           ▼
┌─────────────────────────────────────┐
│           Appointment               │
├─────────────────────────────────────┤
│ _id         : ObjectId (PK)         │
│ patient     : ObjectId → User (FK)  │
│ doctor      : ObjectId → User (FK)  │
│ date        : String                │
│ time        : String                │
│ status      : Enum[pending,         │
│               approved, rejected,   │
│               completed, cancelled] │
│ prescription: String (URL)          │
│ notes       : String                │
│ reason      : String                │
│ createdAt   : Date                  │
│ updatedAt   : Date                  │
└──────────┬──────────────────────────┘
           │ 1
           │
           ▼ many
┌─────────────────────────────────────┐
│              Message                │
├─────────────────────────────────────┤
│ _id         : ObjectId (PK)         │
│ appointment : ObjectId → Appt (FK)  │
│ sender      : ObjectId → User (FK)  │
│ text        : String                │
│ createdAt   : Date                  │
│ updatedAt   : Date                  │
└─────────────────────────────────────┘
```

### Relationships
- **User ↔ Appointment**: One patient can have many appointments. One doctor can have many appointments. (One-to-Many)
- **Appointment ↔ Message**: One appointment has many messages (chat history). (One-to-Many)

---

## 5. Use Case Diagram

```
                    ╔══════════════════════════════════════╗
                    ║         Online Mini OPD System       ║
                    ║                                      ║
  ┌─────────┐       ║  ○ Register Account                  ║
  │         │───────║──○ Login / Logout                    ║
  │ Patient │       ║  ○ Browse Doctors (Search & Filter)  ║
  │         │───────║──○ View Doctor Details               ║
  └─────────┘       ║  ○ Book Appointment                  ║
                    ║  ○ Cancel Appointment                ║
                    ║  ○ View Appointments (with filter)   ║
                    ║  ○ View Prescription                 ║
                    ║  ○ Chat with Doctor (Real-time)      ║
                    ║  ○ Update Profile & Photo            ║
                    ║  ○ Toggle Dark Mode                  ║
                    ║                                      ║
  ┌─────────┐       ║  ○ Register Account                  ║
  │         │───────║──○ Login / Logout                    ║
  │ Doctor  │       ║  ○ View My Appointments              ║
  │         │───────║──○ Approve / Reject Appointment      ║
  └─────────┘       ║  ○ Mark Appointment Complete         ║
                    ║  ○ Upload Prescription               ║
                    ║  ○ Chat with Patient (Real-time)     ║
                    ║  ○ View Dashboard Stats              ║
                    ║  ○ Update Profile & Photo            ║
                    ║                                      ║
  ┌─────────┐       ║  ○ Login (Admin account only)        ║
  │         │───────║──○ View All Users                    ║
  │  Admin  │       ║  ○ Block / Unblock User              ║
  │         │───────║──○ Delete User                       ║
  └─────────┘       ║  ○ View All Appointments             ║
                    ║  ○ View System Analytics             ║
                    ║  ○ Admin Dashboard Stats             ║
                    ╚══════════════════════════════════════╝
```

---

## 6. Data Flow Diagram (DFD)

### Level 0 — Context Diagram

```
                 ┌──────────┐
     Login/      │          │     Patient Data
     Register    │          │◄────────────────────── Patient
  ──────────────►│  Online  │
                 │  Mini    │────────────────────────► Patient
  Appointment    │   OPD    │     Appointments, Chat
  Status, Chat   │  System  │
  ──────────────►│          │◄────────────────────── Doctor
     Approve/    │          │
     Reject      │          │────────────────────────► Doctor
                 │          │     Stats, Chat, Rx
     User Mgmt   │          │
  ──────────────►│          │◄────────────────────── Admin
     Stats Query │          │
                 │          │────────────────────────► Admin
                 └──────────┘     System Stats
```

### Level 1 — System DFD

```
         ┌──────────────────────────────────────────────────┐
         │                   BACKEND SERVER                  │
         │                                                  │
User ───►│  ┌──────────────┐     ┌──────────────────────┐  │
         │  │ 1.0 Auth     │────►│   MongoDB (Users)    │  │
         │  │ Module       │◄────│                      │  │
         │  │ Register     │     └──────────────────────┘  │
         │  │ Login        │                               │
         │  │ Profile Updt │────► Cloudinary (Images)      │
         │  └──────────────┘                               │
         │                                                  │
Patient──►  ┌──────────────┐     ┌──────────────────────┐  │
         │  │ 2.0 Appoint- │────►│  MongoDB (Appts)     │  │
         │  │ ment Module  │◄────│                      │  │
         │  │ Book         │     └──────────────────────┘  │
         │  │ Cancel       │                               │
Doctor──►│  │ Status Updt  │────► Cloudinary (Prescripts)  │
         │  └──────────────┘                               │
         │                                                  │
         │  ┌──────────────┐     ┌──────────────────────┐  │
         │  │ 3.0 Chat     │────►│ MongoDB (Messages)   │  │
         │  │ Module       │◄────│                      │  │
         │  │ Socket.io    │     └──────────────────────┘  │
         │  └──────────────┘                               │
         │                                                  │
Admin ──►│  ┌──────────────┐     ┌──────────────────────┐  │
         │  │ 4.0 Admin    │────►│  MongoDB (All Data)  │  │
         │  │ Module       │◄────│                      │  │
         │  │ User Mgmt    │     └──────────────────────┘  │
         │  │ Analytics    │                               │
         │  └──────────────┘                               │
         └──────────────────────────────────────────────────┘
```

---

## 7. Sequence Diagrams

### 7.1 Patient Books an Appointment

```
Patient App        Backend API          MongoDB           Doctor App
    │                   │                   │                  │
    │──── GET /doctors ─►│                  │                  │
    │                   │──── find({role:"doctor"}) ──────────►│
    │                   │◄─── doctors[] ───────────────────────│
    │◄── doctors list ──│                   │                  │
    │                   │                   │                  │
    │ (selects doctor,  │                   │                  │
    │  picks date/time) │                   │                  │
    │                   │                   │                  │
    │── POST /appts/book►│                  │                  │
    │   {doctorId,date, │                   │                  │
    │    time, token}   │                   │                  │
    │                   │── verify JWT ─────│                  │
    │                   │── Appointment     │                  │
    │                   │   .create({...,   │                  │
    │                   │   status:"pending"}──────────────────►
    │                   │◄── saved ─────────│                  │
    │◄── "Booked ✅" ───│                   │                  │
    │                   │                   │                  │
    │                   │                   │  Doctor fetches  │
    │                   │◄── GET /appts/my ──────────────────── │
    │                   │── find({doctor:id})────────────────── │
    │                   │◄── appointments[] ─│                  │
    │                   │──────────────────────────────────────►│
    │                   │                   │  (sees "pending") │
```

### 7.2 Real-Time Chat Flow

```
Patient App      Socket.io Server      MongoDB          Doctor App
    │                   │                 │                 │
    │── connect() ──────►│                │                 │
    │── joinRoom        │                 │                 │
    │   {appointmentId} ►│                │                 │
    │                   │                 │                 │
    │                   │◄── joinRoom ─────────────────────── │
    │                   │   {appointmentId}│                 │
    │                   │                 │                 │
    │── sendMessage ────►│                │                 │
    │   {text, sender}  │                 │                 │
    │                   │── Message.create()──────────────── │
    │                   │◄── saved ───────│                 │
    │                   │                 │                 │
    │◄── receiveMsg ────│── io.to(room)   │                 │
    │    (from server)  │   .emit ─────────────────────────►│
    │                   │   receiveMessage │                 │
    │                   │                 │                 │
    │── typing ─────────►│               │                 │
    │                   │── userTyping ────────────────────►│
    │── stopTyping ─────►│               │                 │
    │                   │── stopTyping ────────────────────►│
```

### 7.3 Doctor Approves Appointment

```
Doctor App         Backend API           MongoDB
    │                   │                   │
    │── PUT /appts/      │                   │
    │   update-status/   │                   │
    │   {id}             │                   │
    │   {status:"approved"                   │
    │    token}          │                   │
    │                   │── verify JWT ──────│
    │                   │── check role=doctor│
    │                   │── Appt.findById(id)│
    │                   │◄── appointment ────│
    │                   │── appt.status =    │
    │                   │   "approved"       │
    │                   │── appt.save() ─────│
    │                   │◄── saved ──────────│
    │◄── "Status updated ✅"                 │
```

---

## 8. Component / Module Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native)                      │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  App.js     │  │  ThemeContext │  │  services/api.js     │    │
│  │  Navigation │  │  (Dark Mode) │  │  (All API Calls)     │    │
│  │  Role-based │  └──────────────┘  └──────────────────────┘    │
│  └──────┬──────┘                                                 │
│         │                                                        │
│    ┌────┴─────────────────────────────────────────┐             │
│    │                  Screens                     │             │
│    │                                              │             │
│    │  Auth Flow:                                  │             │
│    │  ┌────────────┐  ┌───────────────┐           │             │
│    │  │ SplashScr  │  │ LoginScreen   │           │             │
│    │  └────────────┘  └───────────────┘           │             │
│    │  ┌────────────────────────────────┐           │             │
│    │  │ RegisterScreen                 │           │             │
│    │  └────────────────────────────────┘           │             │
│    │                                              │             │
│    │  Patient Flow (Tab Navigator):               │             │
│    │  ┌───────────────┐ ┌──────────────┐          │             │
│    │  │PatientDashboard│ │DoctorsScreen │          │             │
│    │  └───────────────┘ └──────┬───────┘          │             │
│    │  ┌──────────────────┐     │                  │             │
│    │  │AppointmentsScreen│  ┌──▼──────────────┐   │             │
│    │  └──────────────────┘  │DoctorDetailsScr │   │             │
│    │  ┌───────────────┐     └─────────────────┘   │             │
│    │  │ ProfileScreen │  ┌──────────────┐          │             │
│    │  └───────────────┘  │ ChatScreen   │          │             │
│    │                     └──────────────┘          │             │
│    │  Doctor Flow (Tab Navigator):                │             │
│    │  ┌───────────────┐ ┌──────────────────┐       │             │
│    │  │DoctorDashboard│ │AppointmentsScreen│       │             │
│    │  └───────────────┘ └──────────────────┘       │             │
│    │  ┌───────────────┐                            │             │
│    │  │ ProfileScreen │                            │             │
│    │  └───────────────┘                            │             │
│    │                                              │             │
│    │  Admin Flow (Stack):                         │             │
│    │  ┌──────────────────┐                        │             │
│    │  │  AdminDashboard  │                        │             │
│    │  └──────────────────┘                        │             │
│    └──────────────────────────────────────────────┘             │
│                                                                  │
│  Shared Components:                                              │
│  ┌──────────┐ ┌─────────────┐ ┌───────────┐ ┌────────┐         │
│  │  Card.js │ │CustomButton │ │CustomInput│ │Loader  │         │
│  └──────────┘ └─────────────┘ └───────────┘ └────────┘         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│                                                                  │
│  server.js                                                       │
│  ├── Middleware: helmet, cors, rateLimit, morgan, express.json   │
│  ├── Routes:                                                     │
│  │   ├── /api/auth       → routes/auth.js                       │
│  │   ├── /api/appointments → routes/appointment.js              │
│  │   ├── /api/doctors    → routes/doctor.js                     │
│  │   └── /api/admin      → routes/admin.js                      │
│  ├── Socket.io:                                                  │
│  │   ├── joinRoom        (appointment-based rooms)               │
│  │   ├── sendMessage     (save to DB + broadcast)                │
│  │   ├── typing          (typing indicators)                     │
│  │   └── disconnect      (cleanup online users)                  │
│  └── MongoDB Connection (mongoose)                               │
│                                                                  │
│  Models:                                                         │
│  ├── User.js         (patients, doctors, admins)                 │
│  ├── Appointment.js  (booking records)                           │
│  └── Message.js      (chat messages)                             │
│                                                                  │
│  Middleware:                                                     │
│  ├── authMiddleware.js   (JWT verify)                            │
│  └── roleMiddleware.js   (role check)                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. API Reference

### Base URL
```
http://<your-ip>:5000/api
```

### Authentication
All protected routes require the header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 9.1 Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/register` | ❌ | — | Register new patient or doctor |
| POST | `/login` | ❌ | — | Login and receive JWT token |
| PUT | `/update-profile` | ✅ | Any | Update name and email |
| POST | `/upload-profile` | ✅ | Any | Upload profile image to Cloudinary |

#### POST `/register` — Request Body
```json
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "password": "secret123",
  "role": "patient",
  "specialization": "Cardiologist",
  "experience": 5
}
```

#### POST `/login` — Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "role": "patient",
    "profileImage": "https://res.cloudinary.com/..."
  }
}
```

---

### 9.2 Doctor Routes — `/api/doctors`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ❌ | — | Get all doctors (public) |

---

### 9.3 Appointment Routes — `/api/appointments`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/book` | ✅ | Patient | Book a new appointment |
| GET | `/my` | ✅ | Any | Get my appointments |
| GET | `/stats` | ✅ | Any | Get appointment stats for dashboard |
| PUT | `/update-status/:id` | ✅ | Doctor | Approve / Reject / Complete |
| PUT | `/cancel/:id` | ✅ | Patient | Cancel an appointment |
| POST | `/upload/:id` | ✅ | Doctor | Upload prescription file |
| POST | `/chat/:id` | ✅ | Any | Send a REST chat message |
| GET | `/chat/:id` | ✅ | Any | Get chat history |

#### GET `/stats` — Response
```json
{
  "total": 12,
  "pending": 3,
  "approved": 4,
  "completed": 4,
  "rejected": 1,
  "cancelled": 0
}
```

#### PUT `/update-status/:id` — Request Body
```json
{
  "status": "approved",
  "reason": "Optional rejection reason"
}
```

---

### 9.4 Admin Routes — `/api/admin`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/users` | ✅ | Admin | Get all users |
| GET | `/appointments` | ✅ | Admin | Get all appointments |
| PUT | `/block/:id` | ✅ | Admin | Block a user |
| PUT | `/unblock/:id` | ✅ | Admin | Unblock a user |
| DELETE | `/users/:id` | ✅ | Admin | Delete a user |

---

### 9.5 Socket.io Events

| Event (emit) | Payload | Direction | Description |
|-------------|---------|-----------|-------------|
| `joinRoom` | `{ appointmentId, userId }` | Client → Server | Join appointment chat room |
| `sendMessage` | `{ appointmentId, message: { sender, text } }` | Client → Server | Send a message |
| `typing` | `{ appointmentId, user }` | Client → Server | Typing started |
| `stopTyping` | `{ appointmentId }` | Client → Server | Typing stopped |
| `receiveMessage` | `{ _id, text, sender, createdAt }` | Server → Client | New message broadcast |
| `userTyping` | `userId` | Server → Client | Someone is typing |
| `onlineUsers` | `[userId, ...]` | Server → Client | Online user list |

---

## 10. Mobile App Screens & Navigation

### Navigation Flow Diagram

```
App.js (Root)
│
├── [Splash Screen] — shown for 2.6 seconds on first load
│
├── role === null
│   ├── LoginScreen  ──────────────────► setRole(role)
│   └── RegisterScreen
│
├── role === "patient"
│   └── PatientTabs (Bottom Tab Navigator)
│       ├── Tab: Home     → PatientDashboard
│       ├── Tab: Doctors  → DoctorsScreen
│       │                    └── DoctorDetailsScreen (Stack)
│       │                         └── (Booking Modal)
│       ├── Tab: Appointments → AppointmentsScreen
│       │                        └── ChatScreen (Stack)
│       └── Tab: Profile  → ProfileScreen
│
├── role === "doctor"
│   └── DoctorTabs (Bottom Tab Navigator)
│       ├── Tab: Home         → DoctorDashboard
│       ├── Tab: Appointments → AppointmentsScreen
│       │                        └── ChatScreen (Stack)
│       └── Tab: Profile      → ProfileScreen
│
└── role === "admin"
    └── AdminDashboard (no tabs — standalone screen)
```

### Screen Descriptions

| Screen | Role | Key Features |
|--------|------|-------------|
| **SplashScreen** | All | Animated app intro screen, 2.6s |
| **LoginScreen** | All | Email/password login, JWT stored |
| **RegisterScreen** | Patient/Doctor | Role selector, doctor extra fields |
| **PatientDashboard** | Patient | Greeting, real stats, quick actions, health tips |
| **DoctorDashboard** | Doctor | Stats grid, pending alert, quick actions |
| **AdminDashboard** | Admin | User counts, appointment stats, refresh |
| **DoctorsScreen** | Patient | Search, specialty filter, booking modal |
| **DoctorDetailsScreen** | Patient | Doctor profile, reviews, booking |
| **AppointmentsScreen** | Both | Filter tabs, cards, approve/reject/upload |
| **ChatScreen** | Both | Real-time Socket.io chat, typing indicator |
| **ProfileScreen** | Both | Edit info, upload photo, dark mode toggle |

---

## 11. Admin Panel

The React.js admin panel (`/mini-opd-admin`) provides a web-based interface for system administrators.

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/` | Admin-only login page |
| Dashboard | `/dashboard` | System-wide stats overview |
| Users | `/users` | List, block, unblock, delete users |
| Appointments | `/appointments` | View all appointments with filters |

### Admin Workflow
```
Admin Login
    │
    ▼
Dashboard (stats: users, appointments, blocked)
    │
    ├──► Users Page
    │    ├── View all patients and doctors
    │    ├── Block user (prevents login)
    │    ├── Unblock user (restores access)
    │    └── Delete user
    │
    └──► Appointments Page
         ├── View all appointments system-wide
         ├── Filter by status
         └── See patient/doctor details
```

---

## 12. Real-Time Chat (Socket.io)

### How It Works

1. When a patient opens a chat, the app connects to the Socket.io server.
2. It emits `joinRoom` with the appointment ID — creating an isolated chat room.
3. Both patient and doctor join the same room using the same appointment ID.
4. When a message is sent, it is:
   - Saved to MongoDB (`Message` collection)
   - Broadcast to all users in that room via `receiveMessage`
5. Typing indicators use `typing` / `stopTyping` events with a 1.2-second debounce.
6. Online users are tracked in a `Map<userId, socketId>` in memory.

### Chat Message Schema
```json
{
  "_id": "64abc...",
  "appointment": "64xyz...",
  "sender": "64def...",
  "text": "Hello doctor, I have a fever.",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Connection URL
The chat connects to the deployed Railway backend:
```
https://online-mini-opd-production.up.railway.app
```

---

## 13. Security Implementation

| Security Layer | Implementation | Description |
|---------------|----------------|-------------|
| **Password Hashing** | bcryptjs (10 rounds) | Passwords never stored in plain text |
| **JWT Authentication** | jsonwebtoken (1 day expiry) | Stateless token-based auth |
| **Role-Based Access** | roleMiddleware.js | Doctor/Patient/Admin routes protected |
| **Rate Limiting** | express-rate-limit | Max 100 req / 15 min per IP (DDoS protection) |
| **Security Headers** | Helmet.js | XSS, CSRF, clickjacking protection |
| **Input Validation** | Joi schema validation | Prevents malformed inputs |
| **Admin-Only Routes** | roleMiddleware("admin") | Admin panel APIs fully protected |
| **Block Check** | Login route check | Blocked users cannot login |
| **CORS** | cors() middleware | Controls allowed origins |
| **Environment Secrets** | dotenv (.env file) | DB URI, JWT secret, Cloudinary keys hidden |

### Authentication Flow
```
Client                  Server                  Database
  │                        │                        │
  │── POST /login ─────────►│                       │
  │   {email, password}    │                        │
  │                        │── User.findOne({email})►│
  │                        │◄── user object ─────────│
  │                        │                        │
  │                        │── check isBlocked      │
  │                        │── bcrypt.compare()     │
  │                        │── jwt.sign({id, role}) │
  │                        │                        │
  │◄── {token, user} ──────│                        │
  │                        │                        │
  │── Protected Request ───►│                       │
  │   Authorization: Bearer│                        │
  │                        │── jwt.verify(token)    │
  │                        │── req.user = payload   │
  │                        │── roleMiddleware check  │
  │                        │                        │
  │◄── Protected Data ─────│                        │
```

---

## 14. Setup & Installation Guide

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Expo CLI: `npm install -g expo-cli`
- Android Studio or physical device with Expo Go app

### Step 1 — Clone / Open the Project
```
Project Root: d:\TALHA HUSSAIN\online-mini-opd\
```

### Step 2 — Backend Setup
```powershell
# Navigate to project root
cd "d:\TALHA HUSSAIN\online-mini-opd"

# Install dependencies
npm install

# Create .env file (already exists — verify values)
```

#### .env File Variables
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mini-opd
JWT_SECRET=your_super_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

```powershell
# Start the backend server
node server.js
# OR with auto-restart:
npx nodemon server.js
```

Backend runs at: `http://localhost:5000`

### Step 3 — Mobile App Setup
```powershell
cd "d:\TALHA HUSSAIN\online-mini-opd\mini-opd-app"
npm install
```

Update the API base URL in `src/services/api.js`:
```javascript
// Replace with your computer's local IP address
const BASE_URL = "http://192.168.X.X:5000/api";
```

To find your IP on Windows:
```powershell
ipconfig
# Look for: IPv4 Address . . . : 192.168.X.X
```

```powershell
# Start the Expo development server
npx expo start

# Then scan QR code with Expo Go app on your phone
# OR press 'a' for Android emulator
```

### Step 4 — Admin Panel Setup
```powershell
cd "d:\TALHA HUSSAIN\online-mini-opd\mini-opd-admin"
npm install
npm start
```

Admin panel runs at: `http://localhost:3000`

### Step 5 — Create Admin Account
Since admin cannot register via the app, create one directly in MongoDB:
1. Go to MongoDB Atlas → Browse Collections → users
2. Insert a new document:
```json
{
  "name": "Admin",
  "email": "admin@miniopd.com",
  "password": "<bcrypt hash of your password>",
  "role": "admin",
  "isBlocked": false,
  "profileImage": ""
}
```

Or run this Node.js script once:
```javascript
// scripts/createAdmin.js
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashed = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin",
    email: "admin@miniopd.com",
    password: hashed,
    role: "admin"
  });
  console.log("Admin created ✅");
  process.exit();
});
```

---

## 15. Project Folder Structure

```
online-mini-opd/
│
├── .env                          # Environment variables (secrets)
├── .gitignore
├── package.json                  # Backend dependencies
├── server.js                     # Main backend entry point
├── DOCUMENTATION.md              # This file
│
├── config/
│   └── cloudinary.js             # Cloudinary SDK configuration
│
├── middleware/
│   ├── authMiddleware.js         # JWT token verification
│   └── roleMiddleware.js         # Role-based access control
│
├── models/
│   ├── User.js                   # User schema (patient/doctor/admin)
│   ├── Appointment.js            # Appointment schema
│   └── Message.js                # Chat message schema
│
├── routes/
│   ├── auth.js                   # Register, Login, Profile update
│   ├── appointment.js            # Book, status, cancel, chat, stats
│   ├── doctor.js                 # Get all doctors
│   └── admin.js                  # User management, analytics
│
├── uploads/                      # Local file upload temp folder
│
├── mini-opd-app/                 # React Native (Expo) Mobile App
│   ├── App.js                    # Navigation root, role routing
│   ├── app.json                  # Expo configuration
│   ├── package.json
│   ├── assets/                   # App icons, splash screen, images
│   └── src/
│       ├── components/
│       │   ├── Card.js
│       │   ├── CustomButton.js
│       │   ├── CustomInput.js
│       │   └── Loader.js
│       ├── context/
│       │   └── ThemeContext.js   # Dark/Light mode state
│       ├── screens/
│       │   ├── SplashScreen.js
│       │   ├── LoginScreen.js
│       │   ├── RegisterScreen.js
│       │   ├── PatientDashboard.js
│       │   ├── DoctorDashboard.js
│       │   ├── AdminDashboard.js
│       │   ├── DoctorsScreen.js
│       │   ├── DoctorDetailsScreen.js
│       │   ├── AppointmentsScreen.js
│       │   ├── ChatScreen.js
│       │   └── ProfileScreen.js
│       ├── services/
│       │   └── api.js            # All Axios API calls
│       └── utils/
│           └── colors.js         # Color constants
│
└── mini-opd-admin/               # React.js Admin Web Panel
    ├── package.json
    └── src/
        ├── App.js                # React Router setup
        ├── theme.js              # MUI theme
        ├── components/
        │   └── Layout.js         # Sidebar + Topbar layout
        ├── pages/
        │   ├── Login.js
        │   ├── Dashboard.js
        │   ├── Users.js
        │   └── Appointments.js
        └── services/
            └── api.js            # Admin panel API calls
```

---

## 16. Key Features Summary

### For Patients
| Feature | How It Works |
|---------|-------------|
| Find Doctors | Browse all registered doctors with search by name/specialty and filter chips |
| Book Appointment | Select doctor → pick date & time → confirm booking |
| Track Appointments | View all appointments with status tabs (Pending/Approved/Completed etc.) |
| Chat with Doctor | Real-time Socket.io chat on approved appointments |
| View Prescription | Tap "View Prescription" button — opens Cloudinary PDF/image URL |
| Cancel Appointment | Cancel pending appointments with confirmation dialog |
| Profile Management | Update name, email, upload profile photo |
| Dark Mode | Toggle between light and dark theme |

### For Doctors
| Feature | How It Works |
|---------|-------------|
| Dashboard | Real-time stats: Total patients, Pending, Approved, Completed counts |
| Pending Alert | Orange banner shown when pending requests exist |
| Approve/Reject | Tap buttons on appointment cards to manage requests |
| Upload Prescription | Pick image/PDF from gallery → uploaded to Cloudinary |
| Mark Complete | Mark approved appointments as completed |
| Chat with Patient | Real-time Socket.io chat |
| Profile | Update info and profile photo |

### For Admin
| Feature | How It Works |
|---------|-------------|
| System Stats | Total users, doctors, patients, all appointment counts by status |
| User Management | Block/unblock/delete users |
| Appointments Overview | View all appointments system-wide |

---

## 17. Future Enhancements

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| **Push Notifications** | Notify patients when appointment is approved/rejected | High |
| **Video Consultation** | WebRTC-based video call within appointment | High |
| **Payment Integration** | Consultation fee payment via JazzCash/EasyPaisa | Medium |
| **Doctor Availability Slots** | Doctors set available time slots, patients pick from them | High |
| **Medical Records** | Patient can maintain a history of diagnoses and prescriptions | Medium |
| **Rating & Reviews** | Patients rate doctors after completed appointments | Medium |
| **Search by Location** | Find doctors near the patient's city | Medium |
| **Email Notifications** | Automated emails on booking/status change | Low |
| **Multi-language** | Urdu language support for Pakistani users | Low |
| **Prescription OCR** | Auto-read prescriptions using AI | Low |
| **Telemedicine Video** | In-app video consultation using Agora/WebRTC | High |
| **Insurance Integration** | Support for health insurance claim processing | Low |

---

## Appendix — Error Codes

| HTTP Code | Meaning | Common Cause |
|-----------|---------|-------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | No token / invalid token |
| 403 | Forbidden | Role mismatch / account blocked |
| 404 | Not Found | Resource does not exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side bug / DB connection issue |

---

*Documentation prepared for Online Mini OPD — Final Year Project*
*Last Updated: 2026*
