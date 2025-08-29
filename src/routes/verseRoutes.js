const express = require("express");
const {
  addFavoriteVerse,
  getFavoriteVerses,
  deleteFavoriteVerse,
} = require("../controllers/verseController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/favorites", authenticateToken, addFavoriteVerse);

router.get("/favorites", authenticateToken, getFavoriteVerses);

router.delete("/favorites/:id", authenticateToken, deleteFavoriteVerse);

module.exports = router;
