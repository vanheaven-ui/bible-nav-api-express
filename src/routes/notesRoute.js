const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const requireAuth = require("../middleware/requireAuth"); // Middleware that sets req.user

router.use(requireAuth);

router.post("/", noteController.createNote);
router.get("/", noteController.getNotes);
router.delete("/:id", noteController.deleteNote);

module.exports = router;
