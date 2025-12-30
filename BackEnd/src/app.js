// src/app.js

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const mechanicRoutes = require("./routes/mechanic.routes");
const serviceRoutes = require("./routes/service.routes"); // NEW

const app = express();

// ================= MIDDLEWARE =================

app.use(helmet());
app.use(cors()); // Configure origin in production
app.use(express.json());

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.send("MEC backend server is running");
});

// ================= ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/service", serviceRoutes); // NEW

// ================= 404 HANDLER =================

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
