"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassesByTeamAccess = void 0;
const Class_1 = require("../models/Class");
const Team_1 = require("../models/Team");
/**
 * @swagger
 * /workspace/{workspaceId}/classes/team-access:
 *   get:
 *     summary: Retrieve classes accessible by user's teams
 *     description: Retrieve a list of classes that the authenticated user's teams have access to in a specific workspace.
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
 *         description: A list of accessible classes
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
 *                       workspaceId:
 *                         type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
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
const getClassesByTeamAccess = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                response: null,
                message: "User not authenticated",
            });
        }
        // Get user's teams in this workspace
        const userTeams = await Team_1.TeamModel.find({
            workspaceId,
            assignedTeachers: userId,
        }).populate("accessTo");
        // Extract class IDs that user's teams have access to
        const accessibleClassIds = new Set();
        userTeams.forEach((team) => {
            team.accessTo.forEach((classRef) => {
                accessibleClassIds.add(classRef.toString());
            });
        });
        // If user has no teams or no team access, return empty array
        if (accessibleClassIds.size === 0) {
            return res.status(200).json({
                success: true,
                response: [],
                message: "No accessible classes found",
            });
        }
        // Fetch classes that user's teams have access to
        const accessibleClasses = await Class_1.ClassModel.find({
            _id: { $in: Array.from(accessibleClassIds) },
            workspaceId,
        }).select("classTitle workspaceId");
        return res.status(200).json({
            success: true,
            response: accessibleClasses,
            message: "Accessible classes fetched successfully",
        });
    }
    catch (error) {
        console.error("Error in getClassesByTeamAccess:", error);
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch accessible classes.",
        });
    }
};
exports.getClassesByTeamAccess = getClassesByTeamAccess;
