const pool = require("../db"); // Database connection pool

// Create a new note
const createNote = async (req, res) => {
  const { book, chapter, verse, content } = req.body;
  const userId = req.user?.id; // From auth middleware

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!book || !chapter || !verse || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO notes (user_id, book, chapter, verse, content, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [userId, book, chapter, verse, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Server error while creating note" });
  }
};

// Get all notes (optionally filtered by book/chapter/verse)
const getNotes = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { book, chapter, verse } = req.query;

  let query = "SELECT * FROM notes WHERE user_id = $1";
  const params = [userId];

  if (book) {
    params.push(book);
    query += ` AND book = $${params.length}`;
  }
  if (chapter) {
    params.push(chapter);
    query += ` AND chapter = $${params.length}`;
  }
  if (verse) {
    params.push(verse);
    query += ` AND verse = $${params.length}`;
  }

  query += " ORDER BY created_at DESC";

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error while fetching notes" });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  const userId = req.user?.id;
  const noteId = req.params.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const noteCheck = await pool.query(
      "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    await pool.query("DELETE FROM notes WHERE id = $1", [noteId]);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error while deleting note" });
  }
};

module.exports = {
  createNote,
  getNotes,
  deleteNote,
};
