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
        const newProject = new Projects_1.Project({ projectName, projectDescription });
        const savedNewProject = await newProject.save();
        return res.status(201).json({
            success: true,
            response: savedNewProject,
            message: "Project created",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not post project",
        });
    }
};
exports.postProject = postProject;
