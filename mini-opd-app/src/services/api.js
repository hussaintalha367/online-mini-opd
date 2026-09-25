import axios from "axios";

const BASE_URL = "http://10.108.117.59:5000/api";

// Socket URL — same server, without /api
export const SOCKET_URL = "http://10.108.117.59:5000";

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
      Authorization: `Bearer ${token}`
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
export const updateProfile = (token, data) =>
  axios.put(`${BASE_URL}/auth/update-profile`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const uploadProfileImage = (token, formData) =>
  axios.post(`${BASE_URL}/auth/upload-profile`, formData, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAppointmentStats = (token) =>
  axios.get(`${BASE_URL}/appointments/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });

/* ── Admin APIs ── */
export const getAllUsers = (token) =>
  axios.get(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAllAppointments = (token) =>
  axios.get(`${BASE_URL}/admin/appointments`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const blockUser = (token, id) =>
  axios.put(`${BASE_URL}/admin/block/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const deleteUser = (token, id) =>
  axios.delete(`${BASE_URL}/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const unblockUser = (token, id) =>
  axios.put(`${BASE_URL}/admin/unblock/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

/* ── Push Token ── */
export const registerPushToken = (token, pushToken) =>
  axios.post(`${BASE_URL}/auth/push-token`, { pushToken }, {
    headers: { Authorization: `Bearer ${token}` }
  });

/* ── Chat Attachment Upload ── */
export const uploadChatAttachment = (token, id, formData) =>
  axios.post(`${BASE_URL}/appointments/chat/upload/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
