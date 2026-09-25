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
export const blockUser = (token, id) =>
  axios.put(
    `${BASE_URL}/admin/block/${id}`,
    { isBlocked: true },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

export const unblockUser = (token, id) =>
  axios.put(
    `${BASE_URL}/admin/unblock/${id}`,
    { isBlocked: false },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

export const toggleBlockUser = (token, id, isBlocked) => {
  if (isBlocked) {
    return unblockUser(token, id);
  } else {
    return blockUser(token, id);
  }
};

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