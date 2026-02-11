const passport = require("passport");

const authenticate = passport.authenticate("jwt", { session: false });

const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Authentication error" });
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Unauthorized",
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

const optionalAuthenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Authentication error" });
    }

    if (user) {
      req.user = user;
    }

    next();
  })(req, res, next);
};

module.exports = { authenticate, authenticateJWT, optionalAuthenticateJWT };
