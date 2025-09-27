"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchUser = void 0;
const user_1 = require("../models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * @swagger
 * /users/{userId}:
 *   patch:
 *     summary: Update an existing user's information
 *     tags:
 *       - Users
 *     description: Allows an authenticated user to update a user's name, role, and/or profile image by their ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 example: "Updated User Name"
 *               newRole:
 *                 type: string
 *                 example: "admin"
 *               newProfileImage:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *               newPassword:
 *                 type: string
 *                 example: "newPassword123"
 *               newEmail:
 *                 type: string
 *                 example: "updated@example.com"
 *     responses:
 *       200:
 *         description: The user was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "The user was successfully updated"
 *       400:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Email is already registered"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "The user was not found"
 *       500:
 *         description: Server error when updating the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: string
 *                   example: "Could not change user in the database"
 *                 message:
 *                   type: string
 *                   example: "Could not change user in the database"
 */
const patchUser = async (req, res) => {
    const { userId } = req.params;
    const { newName, newRole, newProfileImage, newPassword, newEmail } = req.body;
    try {
        const user = await user_1.UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "The user was not found",
            });
        }
        // Check for email uniqueness if email is being updated
        if (newEmail && newEmail !== user.email) {
            const existingUser = await user_1.UserModel.findOne({ email: newEmail });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    response: null,
                    message: "Email is already registered",
                });
            }
        }
        // Update fields
        if (newName)
            user.name = newName;
        if (newRole)
            user.role = newRole;
        if (newEmail)
            user.email = newEmail.toLowerCase().trim();
        if (newProfileImage)
            user.profileImage = newProfileImage;
        // Hash password if provided
        if (newPassword) {
            const salt = bcrypt_1.default.genSaltSync();
            user.password = bcrypt_1.default.hashSync(newPassword, salt);
        }
        const updatedUser = await user.save();
        res.status(200).json({
            success: true,
            response: updatedUser,
            message: "The user was successfully updated",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            response: error instanceof Error ? error.message : "Unknown error",
            message: "Could not change user in the database",
        });
    }
};
exports.patchUser = patchUser;
