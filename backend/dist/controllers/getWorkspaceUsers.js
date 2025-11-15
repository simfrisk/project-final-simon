"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceUsers = void 0;
const user_1 = require("../models/user");
/**
 * @swagger
 * /workspace/{workspaceId}/users:
 *   get:
 *     summary: Get all users in a workspace
 *     description: Retrieve a list of all users who are members of a specific workspace.
 *     tags:
 *       - Workspaces
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workspace
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "Workspace users fetched successfully"
 *       404:
 *         description: Workspace not found
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
 *                   example: "Workspace not found"
 *       500:
 *         description: Server error fetching workspace users
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
 *                   example: "Failed to fetch workspace users"
 */
const getWorkspaceUsers = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const result = await user_1.UserModel.find({ workspaces: workspaceId }).select("name email role profileImage");
        return res.status(200).json({
            success: true,
            response: result,
            message: "Workspace users fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch workspace users.",
        });
    }
};
exports.getWorkspaceUsers = getWorkspaceUsers;
