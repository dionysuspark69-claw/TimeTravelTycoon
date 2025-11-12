import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, type User } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function getUserFromHeader(req: Request): Promise<User | null> {
  const replitUserId = req.headers["x-replit-user-id"] as string | undefined;
  const replitUserName = req.headers["x-replit-user-name"] as string | undefined;

  if (!replitUserId || !replitUserName) {
    return null;
  }

  try {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.replitUserId, replitUserId))
      .limit(1);

    if (existingUsers.length > 0) {
      return existingUsers[0];
    }

    const newUsers = await db
      .insert(users)
      .values({
        replitUserId,
        username: replitUserName,
      })
      .returning();

    return newUsers[0];
  } catch (error) {
    console.error("Error getting/creating user:", error);
    return null;
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = await getUserFromHeader(req);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.user = user;
  if (req.session) {
    req.session.userId = user.id;
  }

  next();
}
