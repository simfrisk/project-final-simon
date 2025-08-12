import { UserModel, UserType } from "../models/user";
import { NextFunction, Request, Response } from "express";

// Extend the Express Request interface to include "user"
declare module "express-serve-static-core" {
  interface Request {
    user?: UserType;
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(400).json({ error: "Authorization header missing" });
    }

    const user = await UserModel.findOne({ accessToken: token });

    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token", loggedOut: true });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err); // Optional: for debugging/logging
    res.status(500).json({ error: "Internal server error during authentication" });
  }
};