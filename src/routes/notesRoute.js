const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  createNote,
  getNotes,
  deleteNote,
} = require("../controllers/notesController");

router.post("/", authenticateToken, createNote);
router.get("/", authenticateToken, getNotes);
router.delete("/:id", authenticateToken, deleteNote);

module.exports = router;
