import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, type User } from "@shared/schema";

const callbackURL = process.env.REPLIT_DEPLOYMENT
  ? "https://time-travel-tycoon-billnye.replit.app/auth/google/callback"
  : "http://localhost:5000/auth/google/callback";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value || null;
          const username = profile.displayName || "User";

          const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.googleId, googleId))
            .limit(1);

          if (existingUsers.length > 0) {
            return done(null, existingUsers[0]);
          }

          const newUsers = await db
            .insert(users)
            .values({
              googleId,
              email,
              username,
            })
            .returning();

          return done(null, newUsers[0]);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error as Error);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google sign-in.");
}

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length > 0) {
      done(null, result[0]);
    } else {
      done(new Error("User not found"));
    }
  } catch (error) {
    done(error);
  }
});

export default passport;
