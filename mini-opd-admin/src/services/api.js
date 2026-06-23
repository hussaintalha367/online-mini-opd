import axios from "axios";

const BASE_URL = "https://online-mini-opd-production.up.railway.app/api";

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