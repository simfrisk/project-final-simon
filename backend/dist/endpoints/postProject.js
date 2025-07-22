"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postProject = void 0;
const Projects_1 = require("../models/Projects");
const generateThumbnailUrl = (videoUrl) => {
    if (!videoUrl)
        return "";
    return videoUrl
        .replace("/video/upload/", "/video/upload/so_3,e_video_thumbnail,w_300,h_200,c_fill/")
        .replace(/\.(mp4|mov|avi)$/i, ".jpg");
};
const postProject = async (req, res) => {
    try {
        console.log("Received body:", req.body);
        console.log("Received file:", req.file);
        const { projectName, projectDescription } = req.body;
        if (!projectName) {
            return res.status(400).json({
                success: false,
                response: null,
                message: "Project name is required",
            });
        }
        const videoUrl = req.file?.path || "";
        const thumbnailUrl = generateThumbnailUrl(videoUrl); // <-- add this
        const newProject = new Projects_1.Project({
            projectName,
            projectDescription,
            video: videoUrl,
            thumbnail: thumbnailUrl, // <-- now this works
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
