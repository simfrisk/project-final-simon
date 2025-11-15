import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";
import { Project } from "../models/Projects";
import { generateSrtContent } from "../utils/srtConverter";

/**
 * @swagger
 * /projects/{projectId}/export/srt:
 *   get:
 *     summary: Export all comments for a project as SRT subtitle file
 *     tags:
 *       - Comments
 *       - Export
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: SRT file generated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 1
 *                 00:00:30,000 --> 00:00:35,000
 *                 John Doe: This is a great point in the video
 *
 *                 2
 *                 00:01:15,000 --> 00:01:20,000
 *                 [Q] Jane Smith: Can you explain this part?
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
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Project not found"
 *       500:
 *         description: Failed to export comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Failed to export comments to SRT"
 */
export const exportCommentsToSrt = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { projectId } = req.params;

  try {
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project not found",
      });
    }

    // Fetch all comments for the project (all types: question, public, private)
    const comments = await CommentModel.find({
      projectId,
    }).populate("commentCreatedBy", "name");

    // Generate SRT content
    const srtContent = generateSrtContent(comments as any);

    if (!srtContent) {
      return res.status(200).json({
        success: true,
        response: null,
        message: "No timestamped comments found for this project",
      });
    }

    // Create safe filename from project name
    const safeProjectName = project.projectName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `${safeProjectName}_comments.srt`;

    // Set headers for file download
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", Buffer.byteLength(srtContent, "utf-8"));

    // Send the SRT content
    return res.status(200).send(srtContent);
  } catch (error) {
    console.error("Error exporting comments to SRT:", error);
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to export comments to SRT",
    });
  }
};
