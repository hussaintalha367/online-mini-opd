import React, { useEffect, useState } from "react";
import { getAllUsers, getAllAppointments } from "../services/api";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const usersRes = await getAllUsers(token);
      const appointmentsRes = await getAllAppointments(token);

      setUsers(usersRes.data);
      setAppointments(appointmentsRes.data);
    };
    loadData();
  }, [token]);

  const totalDoctors = users.filter(u => u.role === "doctor").length;
  const totalPatients = users.filter(u => u.role === "patient").length;

  const approved = appointments.filter(a => a.status === "approved").length;
  const pending = appointments.filter(a => a.status === "pending").length;
  const rejected = appointments.filter(a => a.status === "rejected").length;

  const userData = {
    labels: ["Doctors", "Patients"],
    datasets: [
      {
        label: "User Distribution",
        data: [totalDoctors, totalPatients],
        backgroundColor: ["#36A2EB", "#FF6384"]
      }
    ]
  };

  const appointmentData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        label: "Appointments",
        data: [approved, pending, rejected],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"]
      }
    ]
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard 📊</h1>

      <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
        <div>
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>

        <div>
          <h3>Total Appointments</h3>
          <p>{appointments.length}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 50, marginTop: 40 }}>
        <div style={{ width: 400 }}>
          <h3>User Distribution</h3>
          <Pie data={userData} />
        </div>

        <div style={{ width: 400 }}>
          <h3>Appointment Status</h3>
          <Bar data={appointmentData} />
        </div>
      </div>
    </div>
  );
}