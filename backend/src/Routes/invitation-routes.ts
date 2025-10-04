import { Router } from "express"
import { authenticateUser } from "../middleware/authenticateUser"
import {
  createInvitationLink,
  validateInvitationToken,
  useInvitationToken,
  getInvitationHistory,
  deleteInvitation,
  deactivateInvitation,
} from "../controllers/workspace-invitation"

const router = Router()

// Create invitation link (teachers only)
router.post("/workspace/:workspaceId/invite", authenticateUser, createInvitationLink)

// Validate invitation token (public endpoint)
router.get("/invitation/validate/:token", validateInvitationToken)

// Use invitation token (requires authentication)
router.post("/invitation/use", authenticateUser, useInvitationToken)

// Get invitation history (teachers only)
router.get("/workspace/:workspaceId/invitations", authenticateUser, getInvitationHistory)

// Delete invitation (teachers only)
router.delete("/invitation/:invitationId", authenticateUser, deleteInvitation)

// Deactivate invitation (teachers only)
router.patch("/invitation/:invitationId/deactivate", authenticateUser, deactivateInvitation)

export default router
