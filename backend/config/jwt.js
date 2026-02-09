const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { prisma } = require("./prisma");

const jwtSecret =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const userId = jwtPayload.id;

    if (!userId) {
      return done(null, false, { message: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
      },
    });

    if (!user) {
      return done(null, false, { message: "User not found" });
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
});

module.exports = { jwtStrategy, jwtSecret, jwtOptions };
