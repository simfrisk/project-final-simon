"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchProject = void 0;
const Projects_1 = require("../models/Projects");
const patchProject = async (req, res) => {
    const { projectId } = req.params;
    const { newName, newDescription } = req.body;
    try {
        const project = await Projects_1.Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "The project was not found"
            });
        }
        if (newName)
            project.projectName = newName;
        if (newDescription)
            project.projectDescription = newDescription;
        const updatedProject = await project.save();
        res.status(200).json({
            success: true,
            response: updatedProject,
            message: "The project was successfully updated"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            response: error instanceof Error ? error.message : "Unknown error",
            message: "Could not change project in the database"
        });
    }
};
exports.patchProject = patchProject;
