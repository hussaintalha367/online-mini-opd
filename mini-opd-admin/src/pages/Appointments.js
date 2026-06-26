import React, { useEffect, useState } from "react";
import { getAllAppointments } from "../services/api";

export default function Appointments({ token }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadAppointments = async () => {
      const res = await getAllAppointments(token);
      setAppointments(res.data);
    };
    loadAppointments();
  }, [token]);

  return (
    <div style={{ padding: 40 }}>
      <h2>All Appointments 📅</h2>

      <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Patient</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((item) => (
            <tr key={item._id}>
              <td>{item.doctor?.name}</td>
              <td>{item.patient?.name}</td>
              <td>{item.date}</td>
              <td>{item.time}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}