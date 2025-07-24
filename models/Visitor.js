const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    trim: true
  },
  browser: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  device: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  country: {
    type: String,
    trim: true,
    uppercase: true, // country codes like 'PK', 'US'
    default: "UNKNOWN"
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Visitor", visitorSchema);
