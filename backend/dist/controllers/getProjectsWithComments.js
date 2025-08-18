"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsWithComments = void 0;
const Projects_1 = require("../models/Projects");
/**
 * @swagger
 * /classes/projects/with-comments:
 *   get:
 *     summary: Get all projects with comments of type 'question'
 *     description: Returns a list of projects populated with comments where commentType is 'question', including the commenter’s name, profile image, and role. Also includes the classId and project creator details for each project.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of projects with filtered comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       classId:
 *                         type: string
 *                         description: The ID of the class the project belongs to
 *                       projectName:
 *                         type: string
 *                       projectDescription:
 *                         type: string
 *                         nullable: true
 *                       video:
 *                         type: string
 *                         nullable: true
 *                       thumbnail:
 *                         type: string
 *                         nullable: true
 *                       projectCreatedBy:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                             nullable: true
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             commentText:
 *                               type: string
 *                             commentType:
 *                               type: string
 *                             commentCreatedBy:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 profileImage:
 *                                   type: string
 *                                   nullable: true
 *                                 role:
 *                                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
const getProjectsWithComments = async (req, res) => {
    try {
        const result = await Projects_1.Project.find()
            .populate({
            path: "comments",
            match: { commentType: "question" },
            populate: {
                path: "commentCreatedBy",
                select: "name profileImage role",
            },
        })
            .select("projectName projectDescription video classId projectCreatedBy")
            .populate("projectCreatedBy", "name email profileImage");
        return res.status(200).json({
            success: true,
            response: result,
            message: "Projects fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch projects.",
        });
    }
};
exports.getProjectsWithComments = getProjectsWithComments;
