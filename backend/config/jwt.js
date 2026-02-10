const jwt = require("jsonwebtoken");

const jwtSecret =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const jwtOptions = {
  expiresIn: "7d",
};

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, jwtSecret, jwtOptions);
}

function verifyToken(token) {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    return null;
  }
}

module.exports = { jwtSecret, jwtOptions, generateToken, verifyToken };
