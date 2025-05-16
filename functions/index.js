// 📦 Gen 2 Firebase Functions – Events API + Firestore Caching (with Secret)

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const admin = require("firebase-admin");
const axios = require("axios");

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const { defineSecret } = require("firebase-functions/params");

// ✅ Secure secret injection for Gen 2 functions
const NPS_API_KEY = defineSecret("NPS_API_KEY");

setGlobalOptions({
  region: "us-central1",
  memory: "512MiB",
  cpu: 1,
});

admin.initializeApp();
const db = admin.firestore();

const app = express();

// ✅ CORS middleware
const corsHandler = cors({
  origin: [
    "https://national-parks-explorer.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET"],
});

app.use(corsHandler);

// 🔁 Live NPS Events Proxy
app.get("/", async (req, res) => {
  const parkCode = req.query.parkCode;
  const apiKey = process.env.NPS_API_KEY;

  if (!parkCode) return res.status(400).json({ error: "Missing parkCode" });

  try {
    const response = await fetch(
      `https://developer.nps.gov/api/v1/events?parkCode=${parkCode}&api_key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🛑 NPS API failed for ${parkCode}:`, response.status);
      return res.status(500).json({ error: "NPS API Error", details: errorText });
    }

    const data = await response.json();
    if (!Array.isArray(data.data)) {
      console.warn(`⚠️ No valid data received for ${parkCode}`);
      return res.status(200).json({ data: [] });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Function crash error:", error.message);
    res.status(500).json({ error: "Function error", details: error.message });
  }
});

exports.getParkEvents = onRequest({ secrets: [NPS_API_KEY] }, app);

// 🧭 Full List of NPS Park Codes
const parkCodes = [
  "acad", "arch", "badl", "bibe", "bisc", "blca", "brca", "cany", "care", "cave",
  "chis", "cong", "crla", "cuva", "dena", "drto", "ever", "gaar", "glba", "glac", "grca",
  "grte", "grba", "grsa", "grsm", "hale", "havo", "hosp", "indu", "isro", "jotr", "katm",
  "kefj", "kica", "kova", "lacl", "lavo", "maca", "meve", "mora", "noca", "olym", "pefo",
  "pinn", "redw", "romo", "sagu", "seki", "shen", "thro", "viis", "voya", "whsa", "wica",
  "wrst", "yell", "yose", "zion", "npsa", "neri", "jeff", "deva"
];

// 🔁 Cache All Events to Firestore
exports.cacheNPSEvents = onRequest({ secrets: [NPS_API_KEY] }, (req, res) => {
  corsHandler(req, res, async () => {
    console.log("🚀 Starting cacheNPSEvents...");
    const allEvents = [];
    const apiKey = process.env.NPS_API_KEY;

    for (const code of parkCodes) {
      try {
        const response = await axios.get(
          `https://developer.nps.gov/api/v1/events?parkCode=${code}&api_key=${apiKey}`
        );

        const data = response.data?.data;
        if (!Array.isArray(data)) {
          console.error(`❌ Invalid data for ${code}`, response.data);
          continue;
        }

        console.log(`📦 ${code}: ${data.length} events`);

        const events = data.map((event) => ({
          id: event.id,
          title: event.title,
          park: event.parkfullname || code.toUpperCase(),
          start: event.datestart,
          end: event.dateend,
          description: event.description,
          url: event.url || `https://www.nps.gov/planyourvisit/event-details.htm?id=${event.id}`,
        }));

        allEvents.push(...events);
      } catch (error) {
        console.error(`🔥 Error for park ${code}:`, error.message);
      }
    }

    console.log(`✅ Total events collected: ${allEvents.length}`);

    try {
      await db.collection("cache").doc("events").set({
        updatedAt: new Date().toISOString(),
        events: allEvents,
      });

      console.log("✅ Successfully saved events to Firestore");
      res.status(200).send(`✅ Cached ${allEvents.length} events and saved to Firestore`);
    } catch (err) {
      console.error("❌ Firestore write failed:", err.message);
      res.status(500).send("❌ Failed to write to Firestore");
    }
  });
});
