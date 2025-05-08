// functions/index.js or functions/getParkEvents.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors({ origin: true })); // ✅ Allow all origins

app.get("/", async (req, res) => {
  const parkCode = req.query.parkCode;
  const apiKey = "9Yw8gMTPlraXuJxFmDj2RRYHzIuD1KrUm54Bp29w";

  if (!parkCode) return res.status(400).json({ error: "Missing parkCode" });

  try {
    const response = await fetch(`https://developer.nps.gov/api/v1/events?parkCode=${parkCode}&api_key=${apiKey}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching park events:", error);
    res.status(500).json({ error: "Failed to fetch park events" });
  }
});

exports.getParkEvents = functions.https.onRequest(app);
