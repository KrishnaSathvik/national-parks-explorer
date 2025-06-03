// 📦 Gen 2 Firebase Functions – Full Rewrite with CORS + Push + Firestore Cache

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const admin = require("firebase-admin");
const axios = require("axios");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const { defineSecret } = require("firebase-functions/params");

// ✅ Secret management
const NPS_API_KEY = defineSecret("NPS_API_KEY");
const FCM_API_KEY = defineSecret("FCM_API_KEY");

setGlobalOptions({
  region: "us-central1",
  memory: "512MiB",
  cpu: 1,
});

admin.initializeApp();
const db = admin.firestore();

const app = express();

// Replace your CORS configuration in index.js with this:

const corsHandler = cors({
  origin: [
    "https://www.nationalparksexplorerusa.com",
    "https://national-parks-explorer.vercel.app",
    "https://national-parks-explor-git-5ffdad-shadowdevils-projects-ae938de8.vercel.app", // Add your current deploy URL
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
});

app.use(corsHandler);

// Explicit OPTIONS handler for preflight requests
app.options("*", (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  });
  res.status(204).send('');
});

// 🧭 Live NPS Events Proxy Endpoint
app.get("/", async (req, res) => {
  const parkCode = req.query.parkCode;
  const apiKey = process.env.NPS_API_KEY;

  if (!parkCode) {
    return res.status(400).json({ error: "Missing parkCode" });
  }

  try {
    const response = await fetch(
      `https://developer.nps.gov/api/v1/events?parkCode=${parkCode}&api_key=${apiKey}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🛑 NPS API failed:`, errorText);
      return res.status(500).json({ error: "NPS API Error" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Fetch crash:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

exports.getParkEvents = onRequest({ secrets: [NPS_API_KEY] }, app);

// 🌐 Park Codes for Bulk Caching
const parkCodes = [
  "acad", "arch", "badl", "bibe", "bisc", "blca", "brca", "cany", "care", "cave",
  "chis", "cong", "crla", "cuva", "dena", "drto", "ever", "gaar", "glba", "glac", "grca",
  "grte", "grba", "grsa", "grsm", "hale", "havo", "hosp", "indu", "isro", "jotr", "katm",
  "kefj", "kica", "kova", "lacl", "lavo", "maca", "meve", "mora", "noca", "olym", "pefo",
  "pinn", "redw", "romo", "sagu", "seki", "shen", "thro", "viis", "voya", "whsa", "wica",
  "wrst", "yell", "yose", "zion", "npsa", "neri", "jeff", "deva"
];

// 🔁 Cache Events to Firestore
exports.cacheNPSEvents = onRequest({ secrets: [NPS_API_KEY] }, (req, res) => {
  corsHandler(req, res, async () => {
    const apiKey = process.env.NPS_API_KEY;
    const allEvents = [];

    for (const code of parkCodes) {
      try {
        const response = await axios.get(`https://developer.nps.gov/api/v1/events?parkCode=${code}&api_key=${apiKey}`);
        const data = response.data?.data || [];
        const mapped = data.map((event) => ({
          id: event.id,
          title: event.title,
          park: event.parkfullname || code.toUpperCase(),
          start: event.datestart,
          end: event.dateend,
          description: event.description,
          url: event.url || `https://www.nps.gov/planyourvisit/event-details.htm?id=${event.id}`
        }));
        allEvents.push(...mapped);
      } catch (err) {
        console.error(`❌ Error for ${code}:`, err.message);
      }
    }

    try {
      await db.collection("cache").doc("events").set({
        updatedAt: new Date().toISOString(),
        events: allEvents
      });
      res.status(200).send(`✅ Cached ${allEvents.length} events`);
    } catch (err) {
      res.status(500).send("❌ Firestore write failed");
    }
  });
});

// Update your sendWelcomePush function to handle CORS explicitly:
exports.sendWelcomePush = onRequest({ secrets: [FCM_API_KEY] }, (req, res) => {
  // Set CORS headers manually for this endpoint
  res.set({
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  });

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  corsHandler(req, res, async () => {
    const { token } = req.body;
    if (!token) return res.status(400).send("Missing FCM token");

    try {
      await axios.post("https://fcm.googleapis.com/fcm/send", {
        to: token,
        notification: {
          title: "🎉 Welcome to National Parks Explorer!",
          body: "You'll now receive park updates and alerts.",
          icon: "/icons/icon-192x192.png"
        }
      }, {
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
exports.broadcastPush = onRequest({ secrets: [FCM_API_KEY] }, (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const tokens = [];
      const db = admin.firestore();
      const FCM_KEY = process.env.FCM_API_KEY;

      // 🔹 Get tokens from registered users
      const usersSnapshot = await db.collection("users").get();
      for (const userDoc of usersSnapshot.docs) {
        const tokensSnapshot = await db.collection(`users/${userDoc.id}/tokens`).get();
        tokensSnapshot.forEach(doc => {
          const token = doc.data()?.token;
          if (token) tokens.push(token);
        });
      }

      // 🔹 Get tokens from anonymous users
      const anonSnapshot = await db.collection("anonymousTokens").get();
      anonSnapshot.forEach(doc => {
        const token = doc.data()?.token;
        if (token) tokens.push(token);
      });

      if (tokens.length === 0) {
        console.warn("⚠️ No tokens found to send push notification.");
        return res.status(200).send("⚠️ No tokens found.");
      }

      console.log(`📡 Sending push to ${tokens.length} devices`);

      const message = {
        notification: {
          title: "📢 National Parks Explorer Update!",
          body: "Check out the latest blog stories, tips, and park alerts."
        }
      };

      // 🔁 Send push to all tokens
      await Promise.all(tokens.map(token =>
        axios.post("https://fcm.googleapis.com/fcm/send", {
          to: token,
          ...message
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${FCM_KEY}`
          }
        })
      ));

      // 📘 Log the push broadcast
      await db.collection("pushLogs").add({
        type: "broadcast",
        recipients: tokens.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: message.notification,
        triggeredBy: "admin"
      });

      res.status(200).send(`✅ Push sent to ${tokens.length} devices`);
    } catch (err) {
      console.error("❌ Broadcast push failed:", err.message);
      res.status(500).send("❌ Broadcast push failed");
    }
  });
});
exports.scheduledWeeklyPush = onSchedule("every monday 09:00", async () => {
  try {
    const tokens = [];
    const db = admin.firestore();
    const FCM_KEY = process.env.FCM_API_KEY;

    const usersSnap = await db.collection("users").get();
    for (const user of usersSnap.docs) {
      const prefs = user.data()?.notificationPrefs;
      if (prefs?.weeklyTips) {
        const tokenSnap = await db.collection(`users/${user.id}/tokens`).get();
        tokenSnap.forEach(doc => {
          const token = doc.data()?.token;
          if (token) tokens.push(token);
        });
      }
    }

    const anonSnap = await db.collection("anonymousTokens").get();
    anonSnap.forEach(doc => {
      const token = doc.data()?.token;
      if (token) tokens.push(token); // sending to all anonymous users
    });

    if (tokens.length === 0) {
      console.warn("⚠️ No tokens found for scheduled push.");
      return;
    }

    const payload = {
      notification: {
        title: "🗓 Weekly Tip from National Parks Explorer",
        body: "Discover new parks and tips every Monday!"
      }
    };

    await Promise.all(tokens.map(token =>
      axios.post("https://fcm.googleapis.com/fcm/send", {
        to: token,
        ...payload
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${FCM_KEY}`
        }
      })
    ));

    await db.collection("pushLogs").add({
      type: "weekly",
      recipients: tokens.length,
      message: payload.notification,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      triggeredBy: "scheduled"
    });

    console.log(`✅ Weekly push sent to ${tokens.length} devices`);
  } catch (err) {
    console.error("❌ Weekly push failed:", err.message);
  }
});
exports.sendCustomPush = onRequest({ secrets: [FCM_API_KEY] }, (req, res) => {
  corsHandler(req, res, async () => {
    const { title, body } = req.body;
    const db = admin.firestore();
    const FCM_KEY = process.env.FCM_API_KEY;

    if (!title || !body) {
      return res.status(400).send("Missing title or body");
    }

    try {
      const tokens = [];

      const usersSnap = await db.collection("users").get();
      for (const user of usersSnap.docs) {
        const prefs = user.data()?.notificationPrefs;
        if (prefs?.blogUpdates !== false) {
          const tokenSnap = await db.collection(`users/${user.id}/tokens`).get();
          tokenSnap.forEach(doc => {
            const token = doc.data()?.token;
            if (token) tokens.push(token);
          });
        }
      }

      const anonSnap = await db.collection("anonymousTokens").get();
      anonSnap.forEach(doc => {
        const token = doc.data()?.token;
        if (token) tokens.push(token);
      });

      const payload = {
        notification: {
          title,
          body
        }
      };

      const failedTokens = [];

      const sendPush = async (token) => {
        try {
          return await axios.post("https://fcm.googleapis.com/fcm/send", {
            to: token,
            ...payload
          }, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${FCM_KEY}`
            }
          });
        } catch (err) {
          console.warn(`⏱ Retry push failed for token: ${token}`);
          return null;
        }
      };

      const responses = await Promise.all(tokens.map(async (token) => {
        try {
          return await sendPush(token);
        } catch (err) {
          console.warn(`❌ Push failed for token: ${token}. Retrying...`);
          const retry = await sendPush(token);
          if (!retry) failedTokens.push(token);
        }
      }));

      // ✅ Log push
      await db.collection("pushLogs").add({
        type: "custom",
        message: payload.notification,
        recipients: tokens.length,
        failedTokens,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: "admin"
      });

      res.status(200).send(`✅ Push sent to ${tokens.length - failedTokens.length} devices. ❌ Failed: ${failedTokens.length}`);
    } catch (err) {
      console.error("❌ Custom push error:", err.message);
      res.status(500).send("Custom push failed");
    }
  });
});
exports.testPush = onRequest({ secrets: [FCM_API_KEY] }, (req, res) => {
  corsHandler(req, res, async () => {
    const { token, title, body } = req.body;
    const FCM_KEY = process.env.FCM_API_KEY;

    if (!token || !title || !body) {
      return res.status(400).send("Missing token, title or body");
    }

    try {
      const payload = {
        to: token,
        notification: {
          title,
          body
        }
      };

      const response = await axios.post("https://fcm.googleapis.com/fcm/send", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${FCM_KEY}`
        }
      });

      res.status(200).send("✅ Test push sent successfully");
    } catch (err) {
      console.error("❌ Test push failed:", err.message);
      res.status(500).send("Test push failed");
    }
  });
});
