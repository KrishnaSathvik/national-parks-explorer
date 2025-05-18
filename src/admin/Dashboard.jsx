import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const AdminDashboard = () => {
  const [parks, setParks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const parksSnap = await getDocs(collection(db, "parks"));
      const reviewsSnap = await getDocs(collection(db, "reviews"));
      const usersSnap = await getDocs(collection(db, "users"));

      setParks(parksSnap.docs.map(doc => doc.data()));
      setReviews(reviewsSnap.docs.map(doc => doc.data()));
      setUsers(usersSnap.docs.map(doc => doc.data()));
    };

    fetchData();
  }, []);

  const totalFavorites = users.reduce(
    (acc, user) => acc + (user.favoriteParks?.length || 0),
    0
  );

  const topLikedParks = [...parks]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      likes: p.likes || 0,
    }));

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Total Parks" value={parks.length} />
        <Card title="Total Reviews" value={reviews.length} />
        <Card title="Total Users" value={users.length} />
        <Card title="Total Favorites" value={totalFavorites} />
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">🏞️ Top 5 Most Liked Parks</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topLikedParks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="likes" fill="#34D399" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-2xl font-bold text-green-600 mt-2">{value}</h2>
  </div>
);

export default AdminDashboard;
