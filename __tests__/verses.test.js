// This file contains tests for the favorite verses endpoints.

const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db");

// Set NODE_ENV to 'test' for this test file
// This line is now handled globally by jest.setup.js, so it can be removed if present.
// process.env.NODE_ENV = 'test';

// Define users and verses for testing
const testUser = {
  username: "verseuser",
  email: "verse@example.com",
  password: "VersePassword123!",
};

const anotherUser = {
  // New user for cross-user tests
  username: "anotherverseuser",
  email: "anotherverse@example.com",
  password: "AnotherVersePassword123!",
};

const testVerse1 = {
  book: "Psalm",
  chapter: 23,
  verse_number: 1,
  verse_text: "The Lord is my shepherd; I shall not want.",
};

const testVerse2 = {
  book: "John",
  chapter: 3,
  verse_number: 16,
  verse_text:
    "For God so loved the world, that he gave his only begotten Son...",
};

const testVerseForOtherUserDeletion = {
  // New verse for the specific cross-user deletion test
  book: "Romans",
  chapter: 8,
  verse_number: 28,
  verse_text:
    "And we know that in all things God works for the good of those who love him...",
};

let authToken = ""; // To store the token for the main test user
let userId = null; // To store the ID of the main test user
let favoriteVerseId = null; // To store the ID of a favorite verse for deletion tests (belongs to testUser)

let anotherAuthToken = ""; // To store the token for the second test user
let anotherUserId = null; // To store the ID of the second test user

// Before all tests, ensure a clean state and register/login users
beforeAll(async () => {
  try {
    await pool.query("DELETE FROM favorite_verses"); // Clear favorite verses
    await pool.query("DELETE FROM users"); // Clear users
    console.log("Cleaned favorite_verses and users tables before verse tests.");

    // Register and login main test user
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send(testUser);
    expect(signupRes.statusCode).toEqual(201);
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;
    userId = loginRes.body.user.id;
    console.log("Main test user registered and logged in for verse tests.");

    // Register and login another test user
    const anotherSignupRes = await request(app)
      .post("/api/auth/signup")
      .send(anotherUser);
    expect(anotherSignupRes.statusCode).toEqual(201);
    const anotherLoginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: anotherUser.email, password: anotherUser.password });
    expect(anotherLoginRes.statusCode).toEqual(200);
    anotherAuthToken = anotherLoginRes.body.token;
    anotherUserId = anotherLoginRes.body.user.id;
    console.log("Another test user registered and logged in for verse tests.");
  } catch (error) {
    console.error("Error during beforeAll setup for verse tests:", error);
    // Ensure the test suite fails if setup fails
    throw error;
  }
});

// After all tests, clean up the database
afterAll(async () => {
  try {
    await pool.query("DELETE FROM favorite_verses");
    await pool.query("DELETE FROM users");
    console.log("Cleaned favorite_verses and users tables after verse tests.");
    // Note: pool.end() is called in auth.test.js afterAll, so we don't call it here again
    // if running both test files in the same Jest run.
  } catch (error) {
    console.error("Error cleaning up after verse tests:", error);
  }
});

describe("Favorite Verses API", () => {
  // Test adding a favorite verse (success)
  test("should add a favorite verse successfully", async () => {
    const res = await request(app)
      .post("/api/verses/favorites")
      .set("Authorization", `Bearer ${authToken}`)
      .send(testVerse1);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty(
      "message",
      "Verse added to favorites successfully"
    );
    expect(res.body.verse).toHaveProperty("id");
    expect(res.body.verse).toHaveProperty("book", testVerse1.book);
    expect(res.body.verse).toHaveProperty("user_id", userId); // Check if linked to correct user
    favoriteVerseId = res.body.verse.id; // Store ID for deletion test
  });

  // Test adding a duplicate favorite verse
  test("should not add a duplicate favorite verse", async () => {
    const res = await request(app)
      .post("/api/verses/favorites")
      .set("Authorization", `Bearer ${authToken}`)
      .send(testVerse1); // Try adding the same verse again

    expect(res.statusCode).toEqual(409); // Conflict
    expect(res.body).toHaveProperty(
      "message",
      "This verse is already in your favorites."
    );
  });

  // Test adding a favorite verse (missing fields)
  test("should return 400 if required fields are missing when adding a verse", async () => {
    const res = await request(app)
      .post("/api/verses/favorites")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ book: "Incomplete", chapter: 1 }); // Missing verse_number, verse_text

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "message",
      "All verse details are required"
    );
  });

  // Test getting favorite verses (success)
  test("should retrieve favorite verses for the user", async () => {
    // Add another verse to ensure we get multiple
    await request(app)
      .post("/api/verses/favorites")
      .set("Authorization", `Bearer ${authToken}`)
      .send(testVerse2);

    const res = await request(app)
      .get("/api/verses/favorites")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "message",
      "Favorite verses retrieved successfully"
    );
    expect(res.body.verses).toBeInstanceOf(Array);
    expect(res.body.verses.length).toBeGreaterThanOrEqual(2); // Should have at least the two added verses
    expect(
      res.body.verses.some(
        (v) =>
          v.book === testVerse1.book &&
          v.chapter === testVerse1.chapter &&
          v.verse_number === testVerse1.verse_number
      )
    ).toBe(true);
    expect(
      res.body.verses.some(
        (v) =>
          v.book === testVerse2.book &&
          v.chapter === testVerse2.chapter &&
          v.verse_number === testVerse2.verse_number
      )
    ).toBe(true);
  });

  // Test deleting a favorite verse (success)
  test("should delete a favorite verse successfully", async () => {
    expect(favoriteVerseId).not.toBeNull(); // Ensure we have an ID to delete

    const res = await request(app)
      .delete(`/api/verses/favorites/${favoriteVerseId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "message",
      "Favorite verse deleted successfully"
    );

    // Verify it's actually deleted by trying to fetch it
    const getRes = await request(app)
      .get("/api/verses/favorites")
      .set("Authorization", `Bearer ${authToken}`);
    expect(getRes.body.verses.some((v) => v.id === favoriteVerseId)).toBe(
      false
    );
  });

  // Test deleting a non-existent favorite verse
  test("should return 404 if favorite verse to delete is not found or unauthorized", async () => {
    const nonExistentId = 99999; // A high ID unlikely to exist
    const res = await request(app)
      .delete(`/api/verses/favorites/${nonExistentId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "message",
      "Favorite verse not found or unauthorized"
    );
  });

  // New test: should return 404 if another user tries to delete a favorite verse
  test("should return 404 if another user tries to delete a favorite verse", async () => {
    // Create a fresh verse for testUser specifically for this test
    const addRes = await request(app)
      .post("/api/verses/favorites")
      .set("Authorization", `Bearer ${authToken}`)
      .send(testVerseForOtherUserDeletion);

    expect(addRes.statusCode).toEqual(201);
    const verseIdToDeleteByOtherUser = addRes.body.verse.id; // Get the ID of this newly added verse

    // Attempt to delete testUser's verse using anotherUser's token
    const res = await request(app)
      .delete(`/api/verses/favorites/${verseIdToDeleteByOtherUser}`)
      .set("Authorization", `Bearer ${anotherAuthToken}`); // Using the other user's token

    expect(res.statusCode).toEqual(404); // Expect 404 because it's not found for *this* user
    expect(res.body).toHaveProperty(
      "message",
      "Favorite verse not found or unauthorized"
    );

    // Verify the verse still exists for the original user
    const getRes = await request(app)
      .get("/api/verses/favorites")
      .set("Authorization", `Bearer ${authToken}`); // Use original user's token
    expect(
      getRes.body.verses.some((v) => v.id === verseIdToDeleteByOtherUser)
    ).toBe(true);

    // Clean up the verse created for this specific test
    await request(app)
      .delete(`/api/verses/favorites/${verseIdToDeleteByOtherUser}`)
      .set("Authorization", `Bearer ${authToken}`);
  });
});
