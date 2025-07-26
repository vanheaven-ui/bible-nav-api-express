// This file runs before all test files to set up the testing environment.

// Load environment variables from .env file
require('dotenv').config();

// Set NODE_ENV to 'test' globally for all tests
process.env.NODE_ENV = 'test';

// Optional: Log to confirm variables are loaded (for debugging)
console.log('Jest setup: NODE_ENV is', process.env.NODE_ENV);
console.log('Jest setup: DATABASE_URL_TEST is', process.env.DATABASE_URL_TEST ? 'loaded' : 'NOT loaded');
