const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS for local + deployed frontend
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://visitor-analytics-frontend.vercel.app/"
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));
app.options('*', cors()); // ✅ Allow preflight requests

app.use(express.json());

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// ✅ Routes
const analyticsRoutes = require('./routes/analytics');
app.use("/api", analyticsRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
