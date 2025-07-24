const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
  methods: ["GET", "POST"],
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

app.use('/api', require('./routes/analytics'));

const analyticsRoutes = require('./routes/analytics');
app.use("/api", analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
