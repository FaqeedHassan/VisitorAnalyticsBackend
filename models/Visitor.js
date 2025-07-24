const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  ip: String,
  browser: String,
  device: String,
  country: String, // ✅ add this
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Visitor", visitorSchema);
