// This middleware is responsible for verifying JWT tokens and protecting routes.

const jwt = require("jsonwebtoken");

// Middleware function to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get the Authorization header from the request
  const authHeader = req.headers["authorization"];
  // The token is typically in the format "Bearer TOKEN", so we split it to get the token part
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is provided, return a 401 Unauthorized status
  if (token == null) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  // Verify the token using the JWT_SECRET from environment variables
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // If verification fails (e.g., token is invalid or expired), return 403 Forbidden
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    // If token is valid, attach the decoded user payload to the request object
    // This 'user' object will contain the userId that was embedded in the token during login
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken; // Export the middleware function
