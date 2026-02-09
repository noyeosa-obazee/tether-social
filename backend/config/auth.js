const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtSecret } = require("./jwt");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
    expiresIn: TOKEN_EXPIRY,
  });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
};
