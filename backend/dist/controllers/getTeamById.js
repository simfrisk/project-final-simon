"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamById = void 0;
const Team_1 = require("../models/Team");
/**
 * @swagger
 * /teams/{teamId}:
 *   get:
 *     summary: Retrieve a team by ID
 *     description: Retrieve a specific team by its ID with full details.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to retrieve
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     teamName:
 *                       type: string
 *                     createdBy:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     assignedTeachers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                     workspaceId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     accessTo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           classTitle:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Team not found"
 *       500:
 *         description: Server error fetching team
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
const getTeamById = async (req, res) => {
    try {
        const { teamId } = req.params;
        const result = await Team_1.TeamModel.findById(teamId)
            .populate("createdBy", "name email")
            .populate("assignedTeachers", "name email")
            .populate("workspaceId", "name")
            .populate("accessTo", "classTitle");
        if (!result) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Team not found",
            });
        }
        return res.status(200).json({
            success: true,
            response: result,
            message: "Team fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch team.",
        });
    }
};
exports.getTeamById = getTeamById;
