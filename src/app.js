const express = require("express"); 
const cors = require("cors"); 
const authRoutes = require("./routes/authRoutes"); 
const verseRoutes = require("./routes/verseRoutes"); 
const noteRoutes = require("./routes/noteRoutes");

const app = express(); 

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/verses", verseRoutes);

app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
  res.send("Bible Nav API is running!");
});

// Global error handling middleware
// This catches any errors thrown by route handlers or other middleware
app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).send("Something broke!");
});

module.exports = app; 
