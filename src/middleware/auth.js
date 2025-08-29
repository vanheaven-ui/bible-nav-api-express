const jwt = require("jsonwebtoken");

// Middleware function to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is provided, return a 401 Unauthorized status
  if (token == null) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  // Verify the token using the JWT_SECRET from environment variables
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next(); 
  });
};

module.exports = authenticateToken; 
