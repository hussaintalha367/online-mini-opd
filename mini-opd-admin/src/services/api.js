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
  export const toggleBlockUser = (token, id) =>
  axios.put(
    `${BASE_URL}/admin/block/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );