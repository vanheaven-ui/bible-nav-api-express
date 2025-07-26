// This file configures the Express application, sets up middleware,
// and defines the API routes.

const express = require("express"); // Import the Express framework
const cors = require("cors"); // Import CORS middleware for cross-origin requests
const authRoutes = require("./routes/authRoutes"); // Import authentication routes
const verseRoutes = require("./routes/verseRoutes"); // Import favorite verse routes

const app = express(); // Create an Express application instance

// Middleware
app.use(cors()); // Enable CORS for all routes, allowing requests from different origins
app.use(express.json()); // Enable parsing of JSON request bodies

// Routes
// All authentication-related routes will be prefixed with /api/auth
app.use("/api/auth", authRoutes);
// All favorite verse-related routes will be prefixed with /api/verses
app.use("/api/verses", verseRoutes);

// Basic route for testing if the API is running
app.get("/", (req, res) => {
  res.send("Bible Nav API is running!");
});

// Global error handling middleware
// This catches any errors thrown by route handlers or other middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging purposes
  // Send a generic 500 Internal Server Error response to the client
  res.status(500).send("Something broke!");
});

module.exports = app; // Export the configured Express app
