"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postUser = void 0;
const user_1 = require("../models/user");
const WorkspaceInvitation_1 = require("../models/WorkspaceInvitation");
const Team_1 = require("../models/Team");
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [teacher, student]
 *                 example: "student"
 *               invitationToken:
 *                 type: string
 *                 example: "abc123def456"
 *                 description: Optional invitation token for automatic workspace/team joining
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile image upload
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User created"
 *                 userId:
 *                   type: string
 *                 profileImage:
 *                   type: string
 *                   nullable: true
 *                 accessToken:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Invalid input or error creating user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Could not create user"
 *                 errors:
 *                   type: object
 *                   nullable: true
 */
const postUser = async (req, res) => {
    try {
        const { name, email, password, role, invitationToken } = req.body;
        const profileImage = req.file?.path || req.body.profileImage;
        const allowedRoles = ["teacher", "student"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}`,
            });
        }
        // Check for existing email
        const existingUser = await user_1.UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
            });
        }
        // Handle invitation token if provided
        let invitationWorkspaceId = null;
        let invitationTeamId = null;
        if (invitationToken) {
            const invitation = await WorkspaceInvitation_1.WorkspaceInvitationModel.findOne({
                token: invitationToken,
                expiresAt: { $gt: new Date() },
            });
            if (!invitation) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired invitation link",
                });
            }
            // Validate that the requested role matches the invitation's allowed role
            if (role !== invitation.allowedRole) {
                return res.status(400).json({
                    success: false,
                    message: `This invitation is only for ${invitation.allowedRole}s. Please select ${invitation.allowedRole} as your role.`,
                });
            }
            invitationWorkspaceId = invitation.workspaceId;
            invitationTeamId = invitation.teamId;
        }
        const salt = bcrypt_1.default.genSaltSync();
        const hashedPassword = bcrypt_1.default.hashSync(password, salt);
        // Prepare user data with workspace if invited
        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            profileImage,
        };
        // Add workspace to user if signing up via invitation
        if (invitationWorkspaceId) {
            userData.workspaces = [invitationWorkspaceId];
        }
        // Add team to user if signing up via team invitation
        if (invitationTeamId) {
            userData.teams = [invitationTeamId];
        }
        const user = new user_1.UserModel(userData);
        await user.save();
        // Add user to team's assignedTeachers if signing up via team invitation
        if (invitationTeamId) {
            await Team_1.TeamModel.findByIdAndUpdate(invitationTeamId, {
                $addToSet: { assignedTeachers: user._id },
            });
        }
        res.status(201).json({
            success: true,
            message: invitationToken
                ? invitationTeamId
                    ? "User created and added to team"
                    : "User created and added to workspace"
                : "User created",
            userId: user._id,
            profileImage: user.profileImage,
            accessToken: user.accessToken,
            workspaceId: invitationWorkspaceId,
            teams: user.teams?.map((teamId) => teamId.toString()) || [],
        });
    }
    catch (error) {
        console.error("❌ Error creating user:", error);
        res.status(400).json({
            success: false,
            message: "Could not create user",
            errors: error,
        });
    }
};
exports.postUser = postUser;
