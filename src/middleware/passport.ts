import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as authService from "../service/authService.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (error: any) {
        return done(error, undefined);
      }
    }
  )
);

// Boilerplate for passport (not strictly needed for JWT but good for completeness)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
