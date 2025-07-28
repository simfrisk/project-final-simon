"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsWithComments = void 0;
const Projects_1 = require("../models/Projects");
const getProjectsWithComments = async (req, res) => {
    try {
        const result = await Projects_1.Project.find()
            .populate({
            path: 'comments',
            match: { commentType: 'question' }, // ✅ filter comments here
            populate: {
                path: 'commentCreatedBy',
                select: 'name profileImage role',
            }
        })
            .select("projectName projectDescription video thumbnail comments");
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
exports.getProjectsWithComments = getProjectsWithComments;
