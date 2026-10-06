import { Request, Response } from "express"
import { UserModel } from "../models/user"
import { CommentModel } from "../models/Comment"
import { Reply } from "../models/Reply"
import mongoose from "mongoose"

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
 *         description: Invalid user ID, the placeholder account, or a deletion error
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
// The "Deleted User" account that takes over comments and replies of removed users.
const PLACEHOLDER_USER_ID = "68a45fbaca5d5d29fe782190"

// No transaction on purpose: the production database (FerretDB) does not support them.
// Every step is idempotent, so a retry after a failure half way through is safe.
export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    })
  }

  if (userId === PLACEHOLDER_USER_ID) {
    return res.status(400).json({
      success: false,
      message: "This account cannot be deleted",
    })
  }

  const placeholderId = new mongoose.Types.ObjectId(PLACEHOLDER_USER_ID)

  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Reassign comments
    await CommentModel.updateMany(
      { commentCreatedBy: user._id },
      { $set: { commentCreatedBy: placeholderId } }
    )

    // Reassign replies
    await Reply.updateMany(
      { replyCreatedBy: user._id },
      { $set: { replyCreatedBy: placeholderId } }
    )

    // Delete the user last, so a failure above leaves the account in place and the call can be retried
    await UserModel.findByIdAndDelete(user._id)

    res.status(200).json({
      success: true,
      message: "User deleted and comments/replies reassigned",
    })
  } catch (error) {
    console.error("❌ Error deleting user:", error)
    res.status(400).json({
      success: false,
      message: "Could not delete user",
      errors: error instanceof Error ? error.message : error,
    })
  }
}
