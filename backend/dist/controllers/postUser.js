"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postUser = void 0;
const user_1 = require("../models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
const postUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const profileImage = req.file?.path || req.body.profileImage;
        const allowedRoles = ["teacher", "student"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}`,
            });
        }
        const salt = bcrypt_1.default.genSaltSync();
        const hashedPassword = bcrypt_1.default.hashSync(password, salt);
        const user = new user_1.UserModel({
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
    }
    catch (error) {
        console.error("❌ Error creating user:", error);
        res.status(400).json({
            success: false,
            message: "Could not create user",
            errors: error,
        });
    }
};
exports.postUser = postUser;
