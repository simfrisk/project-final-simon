"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeamMember = void 0;
const Team_1 = require("../models/Team");
const user_1 = require("../models/user");
/**
 * @swagger
 * /teams/{teamId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a team
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
 *         description: The ID of the team
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Member removed successfully"
 *       404:
 *         description: Team or User not found
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
 *                   example: "Team or User not found"
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
const deleteTeamMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        const team = await Team_1.TeamModel.findById(teamId);
        const user = await user_1.UserModel.findById(userId);
        if (!team || !user) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Team or User not found",
            });
        }
        // Remove user from team
        await user_1.UserModel.findByIdAndUpdate(userId, {
            $pull: { teams: teamId },
        });
        return res.status(200).json({
            success: true,
            response: null,
            message: "Member removed successfully",
        });
    }
    catch (error) {
        console.error("Error in deleteTeamMember:", error);
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
exports.deleteTeamMember = deleteTeamMember;
