// 📦 Gen 2 Firebase Functions – Events API + Firestore Caching (with Secret)

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const admin = require("firebase-admin");
const axios = require("axios");
const { onSchedule } = require("firebase-functions/v2/scheduler");
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
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
});

app.use(corsHandler);
// ✅ Handle preflight OPTIONS for all routes (required for CORS in Gen 2)
app.options("*", corsHandler);


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

  exports.sendWelcomePush = onRequest((req, res) => {
    corsHandler(req, res, async () => {
      const { token } = req.body;

      if (!token) {
        return res.status(400).send("Missing FCM token");
      }

      try {
        const payload = {
          to: token,
          notification: {
            title: "🎉 Welcome to National Parks Explorer!",
            body: "You’ll now receive park updates and alerts.",
            icon: "/icons/icon-192x192.png"
          }
        };

        await axios.post("https://fcm.googleapis.com/fcm/send", payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${process.env.FCM_API_KEY}`
          }
        });

        res.status(200).send("✅ Welcome push sent");
      } catch (err) {
        console.error("❌ Welcome push failed:", err.message);
        res.status(500).send("Push failed");
      }
    });
  });

  // ✅ Broadcast Push Notification to All Devices (users & anonymous)
  exports.broadcastPush = onRequest(async (req, res) => {
    try {
      const FCM_API_KEY = process.env.FCM_API_KEY; // Secure key from env
      const tokens = [];

      // 🔹 Get all user tokens
      const usersSnapshot = await db.collection("users").get();
      for (const userDoc of usersSnapshot.docs) {
        const tokensSnapshot = await db.collection(`users/${userDoc.id}/tokens`).get();
        tokensSnapshot.forEach(doc => {
          if (doc.data()?.token) tokens.push(doc.data().token);
        });
      }

      // 🔹 Get all anonymous tokens
      const anonSnapshot = await db.collection("anonymousTokens").get();
      anonSnapshot.forEach(doc => {
        if (doc.data()?.token) tokens.push(doc.data().token);
      });

      if (tokens.length === 0) {
        console.warn("⚠️ No tokens found");
        return res.status(200).send("⚠️ No tokens found.");
      }

      console.log(`📡 Sending push to ${tokens.length} tokens...`);

      const message = {
        notification: {
          title: "📢 New Alert from National Parks Explorer!",
          body: "Check out the latest events, tips, and blog stories.",
        }
      };

      const responses = await Promise.all(tokens.map(token =>
        axios.post("https://fcm.googleapis.com/fcm/send", {
          to: token,
          ...message
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${FCM_API_KEY}`
          }
        })
      ));

      console.log(`✅ Push sent to ${tokens.length} devices`);
      res.status(200).send(`✅ Push sent to ${tokens.length} devices`);
    } catch (err) {
      console.error("❌ Broadcast push failed:", err.message);
      res.status(500).send("❌ Broadcast push failed");
    }
  });

  exports.scheduledWeeklyPush = onSchedule("every monday 09:00", async (event) => {
    try {
      const tokens = [];
      const usersSnap = await db.collection("users").get();

      for (const user of usersSnap.docs) {
        const prefs = user.data().notificationPrefs;
        if (prefs?.weeklyTips) {
          const tokenSnap = await db.collection(`users/${user.id}/tokens`).get();
          tokenSnap.forEach(doc => {
            if (doc.data()?.token) tokens.push(doc.data().token);
          });
        }
      }

      const anonSnap = await db.collection("anonymousTokens").get();
      anonSnap.forEach(doc => {
        // Send to all anon users for now
        if (doc.data()?.token) tokens.push(doc.data().token);
      });

      const payload = {
        notification: {
          title: "🗓 Weekly Tip from National Parks Explorer",
          body: "Discover new parks and tips every Monday!",
        }
      };

      await Promise.all(tokens.map(token =>
        axios.post("https://fcm.googleapis.com/fcm/send", {
          to: token,
          ...payload
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${process.env.FCM_API_KEY}`
          }
        })
      ));

      // Log it
      await db.collection("pushLogs").add({
        type: "weekly",
        message: payload.notification,
        recipients: tokens.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: "scheduled"
      });

      console.log(`✅ Weekly push sent to ${tokens.length} devices`);
    } catch (err) {
      console.error("❌ Weekly push failed:", err);
    }
  });

  exports.sendCustomPush = onRequest(async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).send("Missing title or body");
  }

  try {
    const tokens = [];
    const usersSnap = await db.collection("users").get();

    for (const user of usersSnap.docs) {
      const prefs = user.data().notificationPrefs;
      if (prefs?.blogUpdates !== false) {
        const tokenSnap = await db.collection(`users/${user.id}/tokens`).get();
        tokenSnap.forEach(doc => {
          if (doc.data()?.token) tokens.push(doc.data().token);
        });
      }
    }

    const anonSnap = await db.collection("anonymousTokens").get();
    anonSnap.forEach(doc => {
      if (doc.data()?.token) tokens.push(doc.data().token);
    });

    const payload = {
      notification: {
        title,
        body
      }
    };

    await Promise.all(tokens.map(token =>
      axios.post("https://fcm.googleapis.com/fcm/send", {
        to: token,
        ...payload
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${process.env.FCM_API_KEY}`
        }
      })
    ));

    // Log push
    await db.collection("pushLogs").add({
      type: "custom",
      message: { title, body },
      recipients: tokens.length,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      triggeredBy: "admin"
    });

    res.status(200).send(`✅ Push sent to ${tokens.length} devices`);
  } catch (err) {
    console.error("❌ Push failed:", err);
    res.status(500).send("Push failed");
  }
});

