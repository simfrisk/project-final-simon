"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClasses = void 0;
const Class_1 = require("../models/Class");
const Team_1 = require("../models/Team");
const user_1 = require("../models/user");
/**
 * @swagger
 * /workspace/{workspaceId}/classes:
 *   get:
 *     summary: Retrieve classes in a workspace based on user role
 *     description: |
 *       Retrieve a list of classes with their titles for a specific workspace.
 *       - Teachers see all classes in the workspace
 *       - Students only see classes their teams have access to
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workspace to get classes from
 *     responses:
 *       200:
 *         description: A list of classes (filtered by user role and team access for students)
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
 *                       classTitle:
 *                         type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error fetching classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: null
 *                 message:
 *                   type: string
 */
const getClasses = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?._id;
        // Get the user to check their role
        const user = await user_1.UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "User not found",
            });
        }
        let result;
        // Teachers see all classes in the workspace
        if (user.role === "teacher") {
            result = await Class_1.ClassModel.find({ workspaceId }).select("classTitle workspaceId");
        }
        else {
            // Students only see classes their teams have access to
            // Get all teams the student belongs to in this workspace
            const userTeams = await Team_1.TeamModel.find({
                _id: { $in: user.teams },
                workspaceId: workspaceId,
            }).select("accessTo");
            // Collect all class IDs from all teams
            const accessibleClassIds = userTeams.flatMap((team) => team.accessTo);
            // Get unique class IDs
            const uniqueClassIds = [...new Set(accessibleClassIds.map((id) => id.toString()))];
            // Fetch the classes
            result = await Class_1.ClassModel.find({
                _id: { $in: uniqueClassIds },
                workspaceId: workspaceId,
            }).select("classTitle workspaceId");
        }
        return res.status(200).json({
            success: true,
            response: result,
            message: "Classes fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch classes.",
        });
    }
};
exports.getClasses = getClasses;
