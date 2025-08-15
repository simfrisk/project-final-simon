import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import { Project } from "../models/Projects";

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Delete a project along with its comments and replies
 *     tags:
 *       - Projects
 *     security:                   
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to delete
 *     responses:
 *       200:
 *         description: Project and related comments and replies deleted successfully
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
 *                   description: The deleted project object
 *                 message:
 *                   type: string
 *                   example: Project, its comments, and replies were deleted
 *       404:
 *         description: Project not found
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
 *                   example: Project could not be found
 *       500:
 *         description: Server error deleting project
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
 *                   description: Error object or message
 *                 message:
 *                   type: string
 *                   example: Could not delete project
 */
export const deleteProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project could not be found",
      });
    }

    // Step 1: Find all comments for this project
    const comments = await CommentModel.find({ projectId });

    // Step 2: Extract comment IDs to delete associated replies
    const commentIds = comments.map(comment => comment._id);
    await Reply.deleteMany({ commentId: { $in: commentIds } });

    // Step 3: Delete comments
    await CommentModel.deleteMany({ projectId });

    // Step 4: Delete the project itself
    await project.deleteOne();

    return res.status(200).json({
      success: true,
      response: project,
      message: "Project, its comments, and replies were deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not delete project",
    });
  }
};