// This file handles the connection to the PostgreSQL database.

const { Pool } = require("pg");
const { parse } = require("pg-connection-string");

// Determine SSL configuration based on environment
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const connectionString = isTest
  ? process.env.DATABASE_URL_TEST
  : process.env.DATABASE_URL;

// Parse the connection string into individual components
const config = parse(connectionString);

const pool = new Pool({
  user: config.user,
  password: config.password,
  host: config.host,
  port: config.port,
  database: config.database,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Event listener for when the pool connects to the database
pool.on("connect", () => {
  console.log(
    `Connected to the PostgreSQL database: ${
      isTest ? "TEST" : isProduction ? "PRODUCTION" : "DEVELOPMENT"
    }`
  );
});

// Event listener for any errors that occur with the database connection
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err); // Log the error
  process.exit(-1); // Exit the process if a critical database error occurs
});

module.exports = pool; // Export the pool to be used throughout the application
