"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postProject = void 0;
const Projects_1 = require("../models/Projects");
const postProject = async (req, res) => {
    try {
        const { projectName, projectDescription } = req.body;
        if (!projectName) {
            return res.status(400).json({
                success: false,
                response: null,
                message: "Project name is required",
            });
        }
        if (!req.file) {
            // Optional: if you require a video file for every project
            return res.status(400).json({
                success: false,
                response: null,
                message: "Video file is required",
            });
        }
        const videoUrl = req.file?.path || "";
        const newProject = new Projects_1.Project({
            projectName,
            projectDescription,
            video: videoUrl,
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
            // You can differentiate error types here if needed
            return res.status(500).json({
                success: false,
                response: null,
                message: error.message,
            });
        }
        // Fallback generic error response
        return res.status(500).json({
            success: false,
            response: null,
            message: "Unknown server error",
        });
    }
};
exports.postProject = postProject;
