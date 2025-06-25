"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = void 0;
const Projects_1 = require("../models/Projects");
const getProjects = async (req, res) => {
    try {
        const result = await Projects_1.Project.find();
        res.status(200).json({
            success: true,
            response: result,
            message: "Projects fetched successfully"
        });
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch projects."
        });
    }
};
exports.getProjects = getProjects;
