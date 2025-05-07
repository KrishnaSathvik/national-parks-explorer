const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const NPS_API_KEY = "9Yw8gMTPlraXuJxFmDj2RRYHzIuD1KrUm54Bp29w";

exports.getParkEvents = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const parkCode = req.query.parkCode;
    if (!parkCode) {
      return res.status(400).json({ error: "Missing parkCode" });
    }

    try {
      const response = await fetch(
        `https://developer.nps.gov/api/v1/events?parkCode=${parkCode}&api_key=${NPS_API_KEY}`
      );
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });
});
