"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postProject = void 0;
const Projects_1 = require("../models/Projects");
/**
 * @swagger
 * /classes/{classId}/projects:
 *   post:
 *     summary: Create a new project within a class
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the class to add the project to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: "My Awesome Project"
 *               projectDescription:
 *                 type: string
 *                 example: "A detailed description of the project."
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file upload
 *     responses:
 *       201:
 *         description: Project created successfully
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
 *                     classId:
 *                       type: string
 *                     projectName:
 *                       type: string
 *                     projectDescription:
 *                       type: string
 *                     video:
 *                       type: string
 *                     thumbnail:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Project created"
 *       400:
 *         description: Bad request, missing projectName
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
 *                 message:
 *                   type: string
 *                   example: "Project name is required"
 *       500:
 *         description: Server error
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
 *                 message:
 *                   type: string
 *                   example: "Unknown server error"
 */
const generateThumbnailUrl = (videoUrl) => {
    if (!videoUrl)
        return "";
    return videoUrl
        .replace("/video/upload/", "/video/upload/so_3,w_600,h_400,c_fill/")
        .replace(/\.(mp4|mov|avi)$/i, ".jpg");
};
const postProject = async (req, res) => {
    try {
        console.log("Received body:", req.body);
        console.log("Received file:", req.file);
        const { classId } = req.params; // ✅ Grab it from the URL
        const { projectName, projectDescription } = req.body;
        if (!projectName) {
            return res.status(400).json({
                success: false,
                response: null,
                message: "Project name is required",
            });
        }
        const videoUrl = req.file?.path || "";
        const thumbnailUrl = generateThumbnailUrl(videoUrl);
        const newProject = new Projects_1.Project({
            classId,
            projectName,
            projectDescription,
            video: videoUrl,
            thumbnail: thumbnailUrl,
        });
        const savedNewProject = await newProject.save();
        return res.status(201).json({
            success: true,
            response: savedNewProject,
            message: "Project created",
        });
    }
    catch (error) {
        console.error("Error in postProject:", error);
        if (error instanceof Error) {
            return res.status(500).json({
                success: false,
                response: null,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            response: null,
            message: "Unknown server error",
        });
    }
};
exports.postProject = postProject;
