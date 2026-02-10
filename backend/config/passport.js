require("dotenv").config();
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { prisma } = require("./prisma");
const { jwtSecret } = require("./jwt");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwt_payload.id },
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        });

        if (user) {
          return done(null, user);
        }

        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }),
  );
};
