import { Request, Response } from "express";
import { Project } from "../models/Projects";

/**
 * @swagger
 * /classes/projects/with-comments:
 *   get:
 *     summary: Get all projects with comments of type 'question'
 *     description: Returns a list of projects populated with comments where commentType is 'question', including the commenter's name, profile image, and role. Each project also includes the classId.
 *     tags:
 *       - Projects
 *     responses:
 *       200:
 *         description: Projects with filtered comments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64c1f2a3b9f1e1234567890a"
 *                       classId:
 *                         type: string
 *                         example: "64c1f2a3b9f1e1234567890b"
 *                       projectName:
 *                         type: string
 *                         example: "My Cool Project"
 *                       projectDescription:
 *                         type: string
 *                         nullable: true
 *                         example: "A project that does cool things"
 *                       video:
 *                         type: string
 *                         nullable: true
 *                         example: "https://someurl.com/video.mp4"
 *                       thumbnail:
 *                         type: string
 *                         nullable: true
 *                         example: "https://someurl.com/thumbnail.jpg"
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64c1f2a3b9f1e1234567890c"
 *                             commentText:
 *                               type: string
 *                               example: "This is a question comment?"
 *                             commentType:
 *                               type: string
 *                               example: "question"
 *                             commentCreatedBy:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Alice"
 *                                 profileImage:
 *                                   type: string
 *                                   nullable: true
 *                                   example: "https://someurl.com/profile.jpg"
 *                                 role:
 *                                   type: string
 *                                   example: "student"
 *                 message:
 *                   type: string
 *                   example: "Projects fetched successfully"
 *       500:
 *         description: Failed to fetch projects
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
 *                   example: "Failed to fetch projects."
 */
export const getProjectsWithComments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await Project.find()
      .populate({
        path: "comments",
        match: { commentType: "question" },
        populate: {
          path: "commentCreatedBy",
          select: "name profileImage role",
        },
      })
      .select("classId projectName projectDescription video thumbnail comments");

    return res.status(200).json({
      success: true,
      response: result,
      message: "Projects fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch projects.",
    });
  }
};