import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const loginAdmin = (email, password) =>
  axios.post(`${BASE_URL}/auth/login`, { email, password });

export const getAllUsers = (token) =>
  axios.get(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAllAppointments = (token) =>
  axios.get(`${BASE_URL}/admin/appointments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
export const toggleBlockUser = (token, id) =>
  axios.put(
    `${BASE_URL}/admin/block/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

export const verifyDoctor = (token, id, { status, notes }) =>
  axios.put(
    `${BASE_URL}/admin/verify-doctor/${id}`,
    { status, notes },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

export const updateDoctorCredentials = (token, id, data) =>
  axios.put(
    `${BASE_URL}/admin/doctor-credentials/${id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );