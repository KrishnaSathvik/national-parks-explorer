import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-green-700 mb-6 text-center">
        👥 User Management
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">⏳ Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-400">🚫 No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-2xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Display Name</th>
                <th className="p-4">Favorite Parks</th>
                <th className="p-4">Favorite Events</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 text-gray-800">{user.email}</td>
                  <td className="p-4 text-pink-600 font-medium">
                    {user.role || "user"}
                  </td>
                  <td className="p-4 text-gray-700">
                    {user.displayName || "—"}
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs overflow-x-auto">
                    {user.favoriteParks?.length
                      ? user.favoriteParks.join(", ")
                      : "—"}
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs overflow-x-auto">
                    {user.favoriteEvents?.length
                      ? user.favoriteEvents.join(", ")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
