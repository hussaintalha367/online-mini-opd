import React, { useEffect, useState, useCallback } from "react";
import { getAllUsers, toggleBlockUser } from "../services/api";

export default function Users({ token }) {
  const [users, setUsers] = useState([]);

  const loadUsers = useCallback(async () => {
    const res = await getAllUsers(token);
    setUsers(res.data);
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlock = async (id) => {
    await toggleBlockUser(token, id);
    loadUsers();
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>User Management 👥</h2>

      <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isBlocked ? "Blocked ❌" : "Active ✅"}</td>
              <td>
                {user.role !== "admin" && (
                  <button onClick={() => handleBlock(user._id)}>
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}