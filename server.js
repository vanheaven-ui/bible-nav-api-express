// This is the entry point of your application. It sets up the Express app
// and starts the server.

require("dotenv").config(); // Load environment variables from .env file
const app = require("./src/app"); // Import the configured Express app
const port = process.env.PORT || 3000; // Define the port, defaulting to 3000

// Start the server and listen for incoming requests
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
