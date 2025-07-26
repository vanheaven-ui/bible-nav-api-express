// This file defines the API routes for managing favorite bible verses.

const express = require("express");
const {
  addFavoriteVerse,
  getFavoriteVerses,
  deleteFavoriteVerse,
} = require("../controllers/verseController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to add a favorite verse. Protected by authenticateToken middleware.
// POST request to /api/verses/favorites
router.post("/favorites", authenticateToken, addFavoriteVerse);

// Route to get all favorite verses for the authenticated user. Protected.
// GET request to /api/verses/favorites
router.get("/favorites", authenticateToken, getFavoriteVerses);

// Route to delete a specific favorite verse. Protected.
// DELETE request to /api/verses/favorites/:id
router.delete("/favorites/:id", authenticateToken, deleteFavoriteVerse);

module.exports = router;
