import React, { useEffect, useState } from "react";
import { getAllUsers, getAllAppointments } from "../services/api";

export default function Dashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersRes = await getAllUsers(token);
        const appointmentsRes = await getAllAppointments(token);

        setUsers(usersRes.data);
        setAppointments(appointmentsRes.data);
      } catch (error) {
        console.log(error);
      }
    };

    loadData();
  }, [token]);

  const totalDoctors = users.filter(u => u.role === "doctor").length;
  const totalPatients = users.filter(u => u.role === "patient").length;

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard 📊</h1>

      <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
        <div>
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>

        <div>
          <h3>Total Doctors</h3>
          <p>{totalDoctors}</p>
        </div>

        <div>
          <h3>Total Patients</h3>
          <p>{totalPatients}</p>
        </div>

        <div>
          <h3>Total Appointments</h3>
          <p>{appointments.length}</p>
        </div>
      </div>
    </div>
  );
}