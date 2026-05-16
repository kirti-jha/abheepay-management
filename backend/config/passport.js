const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./db');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-client-secret',
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
      try {
          // Check if user already exists
          let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

          if (!user) {
              // Check if a user with the same email already exists (link accounts)
              user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });

              if (user) {
                  // Link Google ID to existing user
                  user = await prisma.user.update({
                      where: { id: user.id },
                      data: { googleId: profile.id, avatar: profile.photos[0]?.value }
                  });
              } else {
                  // Create brand new user
                  user = await prisma.user.create({
                      data: {
                          googleId: profile.id,
                          name: profile.displayName,
                          email: profile.emails[0].value,
                          avatar: profile.photos[0]?.value,
                          role: 'Developer'
                      }
                  });
              }
          }

          done(null, user);
      } catch (err) {
          done(err, null);
      }
  }
));
