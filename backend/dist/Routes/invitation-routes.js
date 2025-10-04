"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateUser_1 = require("../middleware/authenticateUser");
const workspace_invitation_1 = require("../controllers/workspace-invitation");
const router = (0, express_1.Router)();
// Create invitation link (teachers only)
router.post("/workspace/:workspaceId/invite", authenticateUser_1.authenticateUser, workspace_invitation_1.createInvitationLink);
// Validate invitation token (public endpoint)
router.get("/invitation/validate/:token", workspace_invitation_1.validateInvitationToken);
// Use invitation token (requires authentication)
router.post("/invitation/use", authenticateUser_1.authenticateUser, workspace_invitation_1.useInvitationToken);
// Get invitation history (teachers only)
router.get("/workspace/:workspaceId/invitations", authenticateUser_1.authenticateUser, workspace_invitation_1.getInvitationHistory);
// Delete invitation (teachers only)
router.delete("/invitation/:invitationId", authenticateUser_1.authenticateUser, workspace_invitation_1.deleteInvitation);
// Deactivate invitation (teachers only)
router.patch("/invitation/:invitationId/deactivate", authenticateUser_1.authenticateUser, workspace_invitation_1.deactivateInvitation);
exports.default = router;
