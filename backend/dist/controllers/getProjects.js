"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = void 0;
const Projects_1 = require("../models/Projects");
/**
 * @swagger
 * /classes/{classId}/projects:
 *   get:
 *     summary: Get projects for a class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The class ID
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 */
const getProjects = async (req, res) => {
    try {
        const { classId } = req.params;
        const result = await Projects_1.Project.find({ classId })
            .select("projectName projectDescription video thumbnail classId");
        return res.status(200).json({
            success: true,
            response: result,
            message: "Projects fetched successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch projects."
        });
    }
};
exports.getProjects = getProjects;
