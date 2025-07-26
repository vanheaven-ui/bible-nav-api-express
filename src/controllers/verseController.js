// This file contains the logic for managing favorite bible verses.

const pool = require("../db"); // Import the database connection pool

// Controller to add a favorite verse
const addFavoriteVerse = async (req, res) => {
  // Get user ID from the authenticated request (set by auth middleware)
  const userId = req.user.userId;
  // Extract verse details from the request body
  const { book, chapter, verse_number, verse_text } = req.body;

  // Basic input validation
  if (!book || !chapter || !verse_number || !verse_text) {
    return res.status(400).json({ message: "All verse details are required" });
  }

  try {
    // Insert the favorite verse into the database.
    // The UNIQUE constraint on (user_id, book, chapter, verse_number) in the schema
    // will prevent duplicate entries for the same verse by the same user.
    // If a duplicate is attempted, it will throw an error, which we catch.
    const result = await pool.query(
      "INSERT INTO favorite_verses (user_id, book, chapter, verse_number, verse_text) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, book, chapter, verse_number, verse_text]
    );

    res.status(201).json({
      message: "Verse added to favorites successfully",
      verse: result.rows[0],
    });
  } catch (error) {
    // Check for unique constraint violation (PostgreSQL error code 23505)
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "This verse is already in your favorites." });
    }
    console.error("Add favorite verse error:", error);
    res
      .status(500)
      .json({ message: "Server error when adding favorite verse" });
  }
};

// Controller to get all favorite verses for the authenticated user
const getFavoriteVerses = async (req, res) => {
  // Get user ID from the authenticated request
  const userId = req.user.userId;

  try {
    // Retrieve all favorite verses associated with the user ID
    const result = await pool.query(
      "SELECT id, book, chapter, verse_number, verse_text, created_at FROM favorite_verses WHERE user_id = $1 ORDER BY book, chapter, verse_number",
      [userId]
    );

    res.status(200).json({
      message: "Favorite verses retrieved successfully",
      verses: result.rows,
    });
  } catch (error) {
    console.error("Get favorite verses error:", error);
    res
      .status(500)
      .json({ message: "Server error when retrieving favorite verses" });
  }
};

// Controller to delete a favorite verse
const deleteFavoriteVerse = async (req, res) => {
  // Get user ID from the authenticated request
  const userId = req.user.userId;
  // Get the verse ID from the request parameters
  const { id } = req.params; // This 'id' refers to the favorite_verses.id

  try {
    // Delete the favorite verse, ensuring it belongs to the authenticated user
    const result = await pool.query(
      "DELETE FROM favorite_verses WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    // If no rows were deleted, it means the verse was not found or didn't belong to the user
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Favorite verse not found or unauthorized" });
    }

    res.status(200).json({ message: "Favorite verse deleted successfully" });
  } catch (error) {
    console.error("Delete favorite verse error:", error);
    res
      .status(500)
      .json({ message: "Server error when deleting favorite verse" });
  }
};

module.exports = {
  addFavoriteVerse,
  getFavoriteVerses,
  deleteFavoriteVerse,
};
