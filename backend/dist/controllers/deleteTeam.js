"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeam = void 0;
const Team_1 = require("../models/Team");
/**
 * @swagger
 * /teams/{teamId}:
 *   delete:
 *     summary: Delete a team
 *     tags:
 *       - Teams
 *     description: Allows an authenticated user to delete a team by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to delete
 *     responses:
 *       200:
 *         description: The team was successfully deleted
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
 *                   example: The team was successfully deleted
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
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: The team was not found
 *       500:
 *         description: Server error when deleting the team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: string
 *                   example: Could not delete team from the database
 *                 message:
 *                   type: string
 *                   example: Could not delete team from the database
 */
const deleteTeam = async (req, res) => {
    const { teamId } = req.params;
    try {
        const teamDoc = await Team_1.TeamModel.findById(teamId);
        if (!teamDoc) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "The team was not found",
            });
        }
        await Team_1.TeamModel.findByIdAndDelete(teamId);
        res.status(200).json({
            success: true,
            response: null,
            message: "The team was successfully deleted",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            response: error instanceof Error ? error.message : "Unknown error",
            message: "Could not delete team from the database",
        });
    }
};
exports.deleteTeam = deleteTeam;
