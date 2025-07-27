import { UserModel } from "../models/user";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export const postUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, profileImage } = req.body;

    const allowedRoles = ["teacher", "student"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created",
      userId: user._id,
      accessToken: user.accessToken,
    });
  } catch (error) {
    console.error("❌ Error creating user:", error);

    res.status(400).json({
      success: false,
      message: "Could not create user",
      errors: error,
    });
  }
};