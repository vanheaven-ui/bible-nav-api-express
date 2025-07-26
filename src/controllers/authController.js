// This file contains the logic for user authentication (signup and login).

const pool = require("../db"); // Import the database connection pool
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for creating tokens

// Controller for user signup
const signup = async (req, res) => {
  const { username, email, password } = req.body; // Extract user data from request body

  // Basic input validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists by email or username
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email or username already exists" });
    }

    // Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
    const passwordHash = await bcrypt.hash(password, salt); // Hash the password

    // Insert the new user into the database
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, passwordHash]
    );

    const newUser = result.rows[0]; // Get the newly created user's data

    // Generate a JWT token for the new user
    // The token payload includes the user's ID
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Respond with success message, user data (excluding password hash), and the token
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// Controller for user login
const login = async (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body

  // Basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the user by email in the database
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    // If user not found, return 401 Unauthorized
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    // If passwords don't match, return 401 Unauthorized
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token for the authenticated user
    // The token payload includes the user's ID
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Respond with success message, user data (excluding password hash), and the token
    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = {
  signup,
  login,
};
