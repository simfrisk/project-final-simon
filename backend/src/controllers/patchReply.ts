import { Request, Response } from "express"
import { Reply } from "../models/Reply"

/**
 * @swagger
 * /replies/{replyId}:
 *   patch:
 *     summary: Update a reply's content by ID
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
 *         description: The ID of the reply to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newContent
 *             properties:
 *               newContent:
 *                 type: string
 *                 example: Updated reply content here
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   $ref: '#/components/schemas/Reply'  # assuming you have Reply schema defined
 *                 message:
 *                   type: string
 *                   example: The reply was successfully changed
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
 *                   example: The message was not found
 *       500:
 *         description: Server error updating reply
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
 *                   example: Could not change reply in the database
 *                 message:
 *                   type: string
 *                   example: Could not change reply in the database
 */
export const patchReply = async (req: Request, res: Response) => {
  const { replyId } = req.params
  const { newContent } = req.body

  try {
    const reply = await Reply.findById(replyId)

    if (!reply) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "The message was not found",
      })
    }

    reply.content = newContent
    const updatedReply = await reply.save()

    res.status(200).json({
      success: true,
      response: updatedReply,
      message: "The reply was successfully changed",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
      message: "Could not change reply in the database",
    })
  }
}
