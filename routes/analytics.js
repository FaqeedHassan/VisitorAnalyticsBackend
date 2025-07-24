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

      // ✅ Step 1: Get client IP
      let ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
      if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
      if (ip === "::1") ip = "127.0.0.1";

      // ✅ Step 2: Skip private/internal IPs (localhost, etc.)
      const isLocal = ["127.0.0.1", "::1", "localhost"].includes(ip);
      if (isLocal) return res.json({ message: "Localhost IP ignored" });

      // ✅ Step 3: Get country using ipapi.co
      let country = "Unknown";
      try {
        const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`);
        country = geoRes.data.country_name || "Unknown";
      } catch (geoError) {
        console.warn("Geo IP API failed:", geoError.message);
      }

      // ✅ Step 4: Save visitor
      const visitor = new Visitor({ ip, browser, device, country });
      await visitor.save();

      res.json({ success: true });
    } catch (error) {
      console.error("Tracking error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /api/data?start=yyyy-mm-dd&end=yyyy-mm-dd
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
