import axios from "axios";

const BASE_URL = "https://online-mini-opd-production.up.railway.app/api/appointments/book";

export const loginUser = (email, password) =>
  axios.post(`${BASE_URL}/auth/login`, { email, password });

export const registerUser = (data) =>
  axios.post(`${BASE_URL}/auth/register`, data);

export const getDoctors = () =>
  axios.get(`${BASE_URL}/doctors`);

export const bookAppointment = (token, data) =>
  axios.post(`${BASE_URL}/appointments/book`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getMyAppointments = (token) =>
  axios.get(`${BASE_URL}/appointments/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const cancelAppointment = (token, id) =>
  axios.put(`${BASE_URL}/appointments/cancel/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const uploadPrescription = (token, id, formData) =>
  axios.post(`${BASE_URL}/appointments/upload/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });

export const sendMessage = (token, id, text) =>
  axios.post(`${BASE_URL}/appointments/chat/${id}`, { text }, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getMessages = (token, id) =>
  axios.get(`${BASE_URL}/appointments/chat/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  export const updateAppointmentStatus = (token, id, status) =>
  axios.put(
    `${BASE_URL}/appointments/update-status/${id}`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );