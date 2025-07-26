// This file defines the API routes for user authentication.

const express = require("express");
const { signup, login } = require("../controllers/authController"); 

const router = express.Router();

// Define the signup route: POST request to /api/auth/signup
router.post("/signup", signup);

// Define the login route: POST request to /api/auth/login
router.post("/login", login);

module.exports = router; // Export the router
