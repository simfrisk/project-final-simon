"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postTeam = void 0;
const Team_1 = require("../models/Team");
const workspace_1 = require("../models/workspace");
const user_1 = require("../models/user");
/**
 * @swagger
 * /workspace/{workspaceId}/teams:
 *   post:
 *     summary: Create a new team within a workspace
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workspace to add the team to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *             properties:
 *               teamName:
 *                 type: string
 *                 example: "Math Team A"
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60f7b3b3b3b3b3b3b3b3b3b3", "60f7b3b3b3b3b3b3b3b3b3b4"]
 *                 description: Array of user IDs to add as team members
 *               teachers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60f7b3b3b3b3b3b3b3b3b3b5"]
 *                 description: Array of teacher IDs to assign to the team
 *               classes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60f7b3b3b3b3b3b3b3b3b3b6", "60f7b3b3b3b3b3b3b3b3b3b7"]
 *                 description: Array of class IDs to give the team access to
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     teamName:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Team created successfully"
 *       400:
 *         description: Bad Request - missing teamName
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "Team name is required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "Unknown server error"
 */
const postTeam = async (req, res) => {
    try {
        const { teamName, members, teachers, classes } = req.body;
        const { workspaceId } = req.params;
        const createdBy = req.user?._id;
        if (!teamName) {
            return res.status(400).json({
                success: false,
                response: null,
                message: "Team name is required",
            });
        }
        // Verify workspace exists
        const workspace = await workspace_1.WorkspaceModel.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Workspace not found",
            });
        }
        const newTeam = new Team_1.TeamModel({
            teamName,
            createdBy,
            workspaceId,
            assignedTeachers: teachers || [],
            accessTo: classes || [],
        });
        const savedNewTeam = await newTeam.save();
        // Add team to workspace
        await workspace_1.WorkspaceModel.findByIdAndUpdate(workspaceId, {
            $addToSet: { teams: savedNewTeam._id },
        });
        // Add members to team (if provided)
        if (members && members.length > 0) {
            await user_1.UserModel.updateMany({ _id: { $in: members } }, { $addToSet: { teams: savedNewTeam._id } });
        }
        // Add team to assigned teachers (if provided)
        if (teachers && teachers.length > 0) {
            await user_1.UserModel.updateMany({ _id: { $in: teachers } }, { $addToSet: { assignedTeams: savedNewTeam._id } });
        }
        return res.status(201).json({
            success: true,
            response: savedNewTeam,
            message: "Team created successfully",
        });
    }
    catch (error) {
        console.error("Error in postTeam:", error);
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
exports.postTeam = postTeam;
