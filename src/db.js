// This file handles the connection to the PostgreSQL database.

const { Pool } = require('pg'); // Import the Pool class from the pg library

// Create a new Pool instance to manage database connections.
// The connection string is retrieved from environment variables for security.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    ssl: {
        // Required for many cloud-hosted PostgreSQL databases (like Heroku, Render, ElephantSQL)
        // Set to true to reject unauthorized certificates.
        rejectUnauthorized: false
    }
});

// Event listener for when the pool connects to the database
pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database.');
});

// Event listener for any errors that occur with the database connection
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err); // Log the error
    process.exit(-1); // Exit the process if a critical database error occurs
});

module.exports = pool; // Export the pool to be used throughout the application
