import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import { Project } from "../models/Projects";
import { ClassModel } from "../models/Class";

/**
 * @swagger
 * /classes/{classId}:
 *   delete:
 *     summary: Delete a class and all related projects, comments, and replies
 *     description: Removes the specified class and cascades the deletion to all projects, comments, and replies associated with it.
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the class to delete
 *     responses:
 *       200:
 *         description: Class and related data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   $ref: '#/components/schemas/Class'
 *                 message:
 *                   type: string
 *                   example: Class, its projects, comments, and replies were deleted
 *       404:
 *         description: Class not found
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
 *                   example: Class could not be found
 *       500:
 *         description: Server error deleting class
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
 *                   example: Could not delete class
 *                 message:
 *                   type: string
 *                   example: Could not delete class
 */
export const deleteClass = async (req: Request, res: Response) => {
  const { classId } = req.params;

  try {
    const foundClass = await ClassModel.findById(classId);
    if (!foundClass) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Class could not be found",
      });
    }

    // Step 1: Find all comments for this class
    const comments = await CommentModel.find({ classId });

    // Step 2: Delete all replies related to the comments
    const commentIds = comments.map(comment => comment._id);
    await Reply.deleteMany({ commentId: { $in: commentIds } });

    // Step 3: Delete comments
    await CommentModel.deleteMany({ classId });

    // Step 4: Delete projects associated with this class
    if (foundClass.projects && foundClass.projects.length > 0) {
      await Project.deleteMany({ _id: { $in: foundClass.projects } });
    }

    // Step 5: Delete the class
    await foundClass.deleteOne();

    return res.status(200).json({
      success: true,
      response: foundClass,
      message: "Class, its projects, comments, and replies were deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not delete class",
    });
  }
};