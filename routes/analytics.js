const express = require("express");
const router = express.Router();
const geoip = require("geoip-lite");
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
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { browser, device } = req.body;

      // Get IP (handles proxies/load balancers)
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

      // Remove IPv6 localhost formatting (e.g., "::1")
      const cleanIP = ip === "::1" ? "127.0.0.1" : ip;

      // Lookup country by IP
      const geo = geoip.lookup(cleanIP);
      const country = geo?.country || "Unknown";

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

// GET /api/data?start=yyyy-mm-dd&end=yyyy-mm-dd
router.get("/data", async (req, res) => {
  const { start, end } = req.query;
  const filter = {};

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // include entire end day

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
