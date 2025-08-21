"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectById = void 0;
const Projects_1 = require("../models/Projects");
/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Get a project by ID
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
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Project found successfully
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
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64c1f2a3b9f1e1234567890a"
 *                     projectName:
 *                       type: string
 *                       example: "My Cool Project"
 *                     projectDescription:
 *                       type: string
 *                       example: "A project that does cool things"
 *                     teacher:
 *                       type: string
 *                       example: "Mr. Smith"
 *                     video:
 *                       type: string
 *                       example: "https://someurl.com/video.mp4"
 *                     classId:
 *                       type: string
 *                       example: "64c1f2a3b9f1e1234567890b"
 *                     projectCreatedBy:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         profileImage:
 *                           type: string
 *                           nullable: true
 *                           example: "https://someurl.com/profile.jpg"
 *                 message:
 *                   type: string
 *                   example: "Project found"
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
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Project was not found"
 *       500:
 *         description: Server error fetching project
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
 *                   example: "Error message or stack trace"
 *                 message:
 *                   type: string
 *                   example: "Project could not be found"
 */
const getProjectById = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Projects_1.Project.findById(projectId)
            .select("projectName projectDescription teacher video classId projectCreatedBy")
            .populate("projectCreatedBy", "name email profileImage");
        if (!project) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Project was not found",
            });
        }
        const { _id, projectName, projectDescription, video, classId } = project;
        return res.status(200).json({
            success: true,
            response: { _id, projectName, projectDescription, video, classId },
            message: "Project found",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Project could not be found",
        });
    }
};
exports.getProjectById = getProjectById;
