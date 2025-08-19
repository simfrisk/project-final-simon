"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = void 0;
const user_1 = require("../models/user");
const Comment_1 = require("../models/Comment");
const Reply_1 = require("../models/Reply");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user and handle their comments/replies
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "User deleted and comments/replies reassigned"
 *       400:
 *         description: Invalid input or deletion error
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
 *                   example: "Could not delete user"
 *                 errors:
 *                   type: object
 *                   nullable: true
 */
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    const PLACEHOLDER_USER = {
        _id: null,
        name: "Deleted User",
        role: "student",
    };
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = await user_1.UserModel.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Reassign comments
        await Comment_1.CommentModel.updateMany({ commentCreatedBy: user._id }, { $set: { commentCreatedBy: PLACEHOLDER_USER } }).session(session);
        // Reassign replies
        await Reply_1.Reply.updateMany({ replyCreatedBy: user._id }, { $set: { replyCreatedBy: PLACEHOLDER_USER } }).session(session);
        // Delete the user
        await user_1.UserModel.findByIdAndDelete(user._id).session(session);
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            message: "User deleted and comments/replies reassigned",
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ Error deleting user:", error);
        res.status(400).json({
            success: false,
            message: "Could not delete user",
            errors: error,
        });
    }
};
exports.deleteUser = deleteUser;
