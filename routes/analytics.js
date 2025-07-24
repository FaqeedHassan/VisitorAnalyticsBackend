const express = require("express");
const router = express.Router();
const axios = require("axios");
const Visitor = require("../models/Visitor");
const { body, validationResult } = require("express-validator");

// POST /api/track
router.post(
  "/track",
  [
    body("browser").isString().trim().isLength({ max: 50 }),
    body("device").isString().trim().isLength({ max: 50 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { browser, device } = req.body;

      // Get IP (from proxy or raw)
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

      // Clean IP (fallback to public IP for dev)
      const cleanIP =
        ip === "::1" || ip.startsWith("::ffff:127") ? "8.8.8.8" : ip;

      // Lookup country via ipapi.co
      let country = "Unknown";
      try {
        const response = await axios.get(`https://ipapi.co/${cleanIP}/json/`);
        country = response.data?.country_name || "Unknown";
      } catch (geoError) {
        console.warn("Geolocation API failed:", geoError.message);
      }

      const visitor = new Visitor({
        ip: cleanIP,
        browser,
        device,
        country,
      });

      await visitor.save();
      res.json({ success: true });
    } catch (error) {
      console.error("Tracking error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /api/data
router.get("/data", async (req, res) => {
  const { start, end } = req.query;
  const filter = {};

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    filter.timestamp = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  try {
    const data = await Visitor.find(filter).sort({ timestamp: -1 });
    res.json(data);
  } catch (err) {
    console.error("Error in /data:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
