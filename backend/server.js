require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const { jwtStrategy } = require("./config/jwt");

const app = express();

app.use(cors());
app.use(express.json());

passport.use("jwt", jwtStrategy);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", require("./routes/auth"));
// app.use("/api/users", require("./routes/users"));
// app.use("/api/posts", require("./routes/posts"));
// app.use("/api/messages", require("./routes/messages"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
