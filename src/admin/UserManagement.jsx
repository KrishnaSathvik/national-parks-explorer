// ✅ Polished UserManagement.jsx with consistent modern UI
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  collectionGroup
} from "firebase/firestore";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [pushLogs, setPushLogs] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const userData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchTokens = async () => {
      try {
        const tokenDocs = await getDocs(collectionGroup(db, "tokens"));
        const anonDocs = await getDocs(collection(db, "anonymousTokens"));
        const allTokens = [];

        tokenDocs.forEach(doc => {
          allTokens.push({ id: doc.id, token: doc.data().token, source: "user" });
        });

        anonDocs.forEach(doc => {
          allTokens.push({ id: doc.id, token: doc.data().token, source: "anonymous" });
        });

        setTokens(allTokens);
      } catch (err) {
        console.error("Error fetching FCM tokens:", err);
      }
    };

    const fetchLogs = async () => {
      try {
        const snap = await getDocs(collection(db, "pushLogs"));
        const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPushLogs(logs.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
      } catch (err) {
        console.error("Error fetching push logs:", err);
      }
    };

    fetchUsers();
    fetchTokens();
    fetchLogs();
  }, []);

  const handleBroadcast = async () => {
    try {
      const res = await fetch(
        "https://us-central1-national-parks-explorer-7bc55.cloudfunctions.net/broadcastPush"
      );
      const text = await res.text();
      alert(text);
    } catch (err) {
      console.error("Push broadcast failed:", err);
      alert("❌ Broadcast failed");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-white via-pink-50 to-pink-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">👥 User Management</h1>

      <button
        onClick={handleBroadcast}
        className="mb-6 bg-pink-600 text-white px-5 py-2 rounded-full hover:bg-pink-700 shadow"
      >
        🔔 Broadcast Push to All Devices
      </button>

      <div className="mb-8 p-5 rounded-2xl bg-white/90 backdrop-blur-md shadow">
        <h2 className="text-xl font-semibold mb-3">✍️ Send Custom Push Notification</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const title = e.target.title.value.trim();
            const body = e.target.body.value.trim();
            if (!title || !body) return alert("Both fields are required!");

            try {
              const res = await fetch(
                "https://us-central1-national-parks-explorer-7bc55.cloudfunctions.net/sendCustomPush",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title, body }),
                }
              );
              const msg = await res.text();
              alert(msg);
            } catch (err) {
              console.error("❌ Failed to send push:", err);
              alert("Failed to send custom push");
            }
          }}
        >
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" required className="w-full mt-1 border rounded px-3 py-2 shadow-sm" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea name="body" required className="w-full mt-1 border rounded px-3 py-2 shadow-sm" />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
          >
            🚀 Send Push
          </button>
        </form>
      </div>

      {/* 🧾 User Table */}
      <div className="overflow-x-auto bg-white/90 backdrop-blur-md rounded-2xl shadow mb-10">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left sticky top-0">
            <tr>
              <th className="p-4">User ID</th>
              <th className="p-4">Favorite Parks</th>
              <th className="p-4">Favorite Events</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{user.id}</td>
                <td className="p-4 text-gray-700">{user.favoriteParks?.join(", ") || "None"}</td>
                <td className="p-4 text-gray-700">{user.favoriteEvents?.join(", ") || "None"}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📬 FCM Tokens */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">📬 All FCM Tokens</h2>
        <div className="overflow-x-auto bg-white/90 backdrop-blur-md rounded-2xl shadow max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left sticky top-0">
              <tr>
                <th className="p-4">Token</th>
                <th className="p-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 break-all text-gray-700">{t.token}</td>
                  <td className="p-4 capitalize text-gray-500">{t.source}</td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr>
                  <td colSpan="2" className="p-4 text-center text-gray-500">No FCM tokens found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📝 Push Logs */}
      <div>
        <h2 className="text-xl font-semibold mb-2">📝 Push Notification Logs</h2>
        <div className="overflow-x-auto bg-white/90 backdrop-blur-md rounded-2xl shadow max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left sticky top-0">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Message</th>
                <th className="p-4">Recipients</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {pushLogs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 capitalize text-gray-700">{log.type}</td>
                  <td className="p-4 text-gray-800">
                    <strong>{log.message?.title}</strong>
                    <br />
                    <span>{log.message?.body}</span>
                  </td>
                  <td className="p-4 text-gray-600">{log.recipients}</td>
                  <td className="p-4 text-gray-500">{log.timestamp?.toDate().toLocaleString()}</td>
                </tr>
              ))}
              {pushLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">No logs yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;