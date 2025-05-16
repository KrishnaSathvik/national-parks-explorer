import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👥 User Management</h1>
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">User ID</th>
              <th className="p-4">Favorite Parks</th>
              <th className="p-4">Favorite Events</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-4 break-all">{user.id}</td>
                <td className="p-4">
                  {user.favoriteParks?.length || 0}{" "}
                  <span className="text-gray-400">(IDs: {user.favoriteParks?.join(", ") || "None"})</span>
                </td>
                <td className="p-4">
                  {user.favoriteEvents?.length || 0}{" "}
                  <span className="text-gray-400">(IDs: {user.favoriteEvents?.join(", ") || "None"})</span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
