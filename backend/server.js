require("dotenv").config();

const dns = require("node:dns");
const express = require("express");
const mongoose = require("mongoose");

// Use Cloudflare DNS for MongoDB Atlas DNS lookups
dns.setServers(["1.1.1.1"]);

const patientRoutes = require("./routes/patientRoutes");

const app = express();

const PORT = process.env.PORT || 5000;


// Middleware for JSON requests
app.use(express.json());

// Patient Management Routes (local development only)
if (process.env.NODE_ENV !== "production") {
  app.use("/api/patients", patientRoutes);
}

// Home route
app.get("/", (req, res) => {
  res.send("Hospital Management System API is running!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HMS Backend is running successfully",
    status: "OK"
  });
});

// Connect to MongoDB, then start Express
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hospital_management"
    });

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`HMS server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
