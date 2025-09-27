"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeamClass = void 0;
const Team_1 = require("../models/Team");
const Class_1 = require("../models/Class");
/**
 * @swagger
 * /teams/{teamId}/classes/{classId}:
 *   delete:
 *     summary: Remove a team's access to a class
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
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the class to remove access from
 *     responses:
 *       200:
 *         description: Class access removed successfully
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
 *                   example: "Class access removed successfully"
 *       404:
 *         description: Team or Class not found
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
 *                   example: "Team or Class not found"
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
const deleteTeamClass = async (req, res) => {
    try {
        const { teamId, classId } = req.params;
        const team = await Team_1.TeamModel.findById(teamId);
        const classDoc = await Class_1.ClassModel.findById(classId);
        if (!team || !classDoc) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Team or Class not found",
            });
        }
        // Remove class from team's accessTo
        await Team_1.TeamModel.findByIdAndUpdate(teamId, {
            $pull: { accessTo: classId },
        });
        return res.status(200).json({
            success: true,
            response: null,
            message: "Class access removed successfully",
        });
    }
    catch (error) {
        console.error("Error in deleteTeamClass:", error);
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
exports.deleteTeamClass = deleteTeamClass;
