"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceById = void 0;
const workspace_1 = require("../models/workspace");
/**
 * @swagger
 * /workspace/{workspaceId}:
 *   get:
 *     summary: Retrieve a workspace by ID
 *     description: Retrieve a specific workspace by its ID with full details.
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
 *         description: The ID of the workspace to retrieve
 *     responses:
 *       200:
 *         description: Workspace retrieved successfully
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
 *                     name:
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
 *                     teams:
 *                       type: array
 *                       items:
 *                         type: object
 *                     classes:
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
 *         description: Server error fetching workspace
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
const getWorkspaceById = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const result = await workspace_1.WorkspaceModel.findById(workspaceId)
            .populate("createdBy", "name email")
            .populate("teams", "teamName")
            .populate("classes", "classTitle");
        if (!result) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Workspace not found",
            });
        }
        return res.status(200).json({
            success: true,
            response: result,
            message: "Workspace fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch workspace.",
        });
    }
};
exports.getWorkspaceById = getWorkspaceById;
