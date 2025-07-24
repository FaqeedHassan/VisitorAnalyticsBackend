const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Step 1: CORS Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://visitor-analytics-frontend.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));
app.options('*', cors()); // preflight support

// ✅ Step 2: JSON middleware
app.use(express.json());

// ✅ Step 3: Fallback CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://visitor-analytics-frontend.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// ✅ DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// ✅ Routes
const analyticsRoutes = require('./routes/analytics');
app.use("/api", analyticsRoutes);

// ✅ Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
