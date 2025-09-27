"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaces = void 0;
const workspace_1 = require("../models/workspace");
/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Retrieve all workspaces
 *     description: Retrieve a list of workspaces with their names.
 *     tags:
 *       - Workspaces
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of workspaces
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
 *                       name:
 *                         type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error fetching workspaces
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
const getWorkspaces = async (req, res) => {
    try {
        const result = await workspace_1.WorkspaceModel.find().select("name");
        return res.status(200).json({
            success: true,
            response: result,
            message: "Workspaces fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch workspaces.",
        });
    }
};
exports.getWorkspaces = getWorkspaces;
