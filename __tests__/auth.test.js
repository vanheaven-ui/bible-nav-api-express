// This file contains tests for the authentication endpoints (signup and login).

const request = require("supertest"); // Import supertest for making HTTP requests
const app = require("../src/app"); 
const pool = require("../src/db"); // Import the database pool for setup/teardown

// Set NODE_ENV to 'test' for this test file to ensure it uses the test database
// process.env.NODE_ENV = "test";

// Define a user for testing
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "Password123!",
};

// Before all tests run, clear the users table to ensure a clean state
beforeAll(async () => {
  try {
    await pool.query("DELETE FROM users"); // Clear existing users
    console.log("Cleaned users table before tests.");
  } catch (error) {
    console.error("Error cleaning users table:", error);
  }
});

// After all tests run, clean up the database and end the pool
afterAll(async () => {
  try {
    await pool.query("DELETE FROM users"); // Clean up after tests
    console.log("Cleaned users table after tests.");
    await pool.end(); // Close the database connection pool
    console.log("Database pool ended.");
  } catch (error) {
    console.error("Error cleaning up after tests or ending pool:", error);
  }
});

describe("Auth API", () => {
  let authToken = ""; // To store the token for authenticated requests

  // Test for user signup (success case)
  test("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("username", testUser.username);
    expect(res.body.user).toHaveProperty("email", testUser.email);
    expect(res.body).toHaveProperty("token");
  });

  // Test for user signup (duplicate email/username)
  test("should not register a user with existing email or username", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser); // Try to register the same user again

    expect(res.statusCode).toEqual(409); // Conflict status code
    expect(res.body).toHaveProperty(
      "message",
      "User with this email or username already exists"
    );
  });

  // Test for user signup (missing fields)
  test("should return 400 if required fields are missing during signup", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ username: "incomplete", email: "incomplete@example.com" }); // Missing password

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message", "All fields are required");
  });

  // Test for user login (success case)
  test("should log in an existing user successfully", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Logged in successfully");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("email", testUser.email);
    expect(res.body).toHaveProperty("token");
    authToken = res.body.token; // Store the token for subsequent tests
  });

  // Test for user login (invalid password)
  test("should return 401 for invalid password during login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  // Test for user login (non-existent email)
  test("should return 401 for non-existent email during login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "anypassword",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  // Test for user login (missing fields)
  test("should return 400 if email or password are missing during login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email }); // Missing password

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "message",
      "Email and password are required"
    );
  });

  // Test that a protected route (e.g., get favorite verses) fails without token
  test("should return 401 for protected route without token", async () => {
    const res = await request(app).get("/api/verses/favorites"); // Protected route

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Authentication token required");
  });

  // Test that a protected route fails with invalid token
  test("should return 403 for protected route with invalid token", async () => {
    const res = await request(app)
      .get("/api/verses/favorites")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("message", "Invalid or expired token");
  });
});
