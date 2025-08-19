"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReply = void 0;
const Reply_1 = require("../models/Reply");
/**
 * @swagger
 * /replies/{replyId}:
 *   delete:
 *     summary: Delete a reply by ID
 *     description: Deletes a reply with the specified ID.
 *     tags:
 *       - Replies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reply to delete
 *     responses:
 *       200:
 *         description: Reply was deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   description: The deleted reply object
 *                 message:
 *                   type: string
 *                   example: The reply was deleted
 *       404:
 *         description: Reply not found
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
 *                 message:
 *                   type: string
 *                   example: Reply could not be found
 *       500:
 *         description: Server error deleting reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Could not delete reply
 */
const deleteReply = async (req, res) => {
    const { replyId } = req.params;
    try {
        const reply = await Reply_1.Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Reply could not be found",
            });
        }
        await reply.deleteOne();
        return res.status(200).json({
            success: true,
            response: reply,
            message: "The reply was deleted",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not delete reply",
        });
    }
};
exports.deleteReply = deleteReply;
