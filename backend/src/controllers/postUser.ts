import { UserModel } from "../models/user";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     security:                   
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [teacher, student]
 *                 example: "student"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile image upload
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User created"
 *                 userId:
 *                   type: string
 *                 profileImage:
 *                   type: string
 *                   nullable: true
 *                 accessToken:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Invalid input or error creating user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Could not create user"
 *                 errors:
 *                   type: object
 *                   nullable: true
 */
export const postUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const profileImage = (req.file as any)?.path || req.body.profileImage;

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
      profileImage: user.profileImage,
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