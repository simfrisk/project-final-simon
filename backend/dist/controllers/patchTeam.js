"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchTeam = void 0;
const Team_1 = require("../models/Team");
/**
 * @swagger
 * /teams/{teamId}:
 *   patch:
 *     summary: Update an existing team's name
 *     tags:
 *       - Teams
 *     description: Allows an authenticated user to update the name of a team by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 example: Updated Team Name
 *     responses:
 *       200:
 *         description: The team was successfully updated
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
 *                 message:
 *                   type: string
 *                   example: The team was successfully updated
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
 *         description: Server error when updating the team
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
 *                   example: Could not change team in the database
 *                 message:
 *                   type: string
 *                   example: Could not change team in the database
 */
const patchTeam = async (req, res) => {
    const { teamId } = req.params;
    const { newName } = req.body;
    try {
        const teamDoc = await Team_1.TeamModel.findById(teamId);
        if (!teamDoc) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "The team was not found",
            });
        }
        if (newName)
            teamDoc.teamName = newName;
        const updatedTeam = await teamDoc.save();
        res.status(200).json({
            success: true,
            response: updatedTeam,
            message: "The team was successfully updated",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            response: error instanceof Error ? error.message : "Unknown error",
            message: "Could not change team in the database",
        });
    }
};
exports.patchTeam = patchTeam;
