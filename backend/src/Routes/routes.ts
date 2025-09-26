import express from "express"
import { authenticateUser } from "../middleware/authenticateUser"
import { uploadVideo } from "../middleware/uploadVideo"
import { uploadImage } from "../middleware/uploadImage"

// Import controllers
import { deleteClass } from "../controllers/deleteClass"
import { deleteComment } from "../controllers/deleteComment"
import { deleteProject } from "../controllers/deleteProject"
import { deleteReply } from "../controllers/deleteReply"
import { deleteUser } from "../controllers/deleteUser"
import { getAllComments } from "../controllers/getAllComments"
import { getClassById } from "../controllers/getClassById"
import { getClasses } from "../controllers/getClasses"
import { getCommentById } from "../controllers/getCommentById"
import { getComments } from "../controllers/getComments"
import { getHome } from "../controllers/getHome"
import { getPrivateComments } from "../controllers/getPrivateComments"
import { getProjectById } from "../controllers/getProjectById"
import { getProjects } from "../controllers/getProjects"
import { getProjectsWithComments } from "../controllers/getProjectsWithComments"
import { getReplies } from "../controllers/getReplies"
import { patchClass } from "../controllers/patchClass"
import { patchComment } from "../controllers/patchComment"
import { patchIsChecked } from "../controllers/patchIsChecked"
import { patchProject } from "../controllers/patchProjects"
import { patchReply } from "../controllers/patchReply"
import { postClass } from "../controllers/postClass"
import { postCommentById } from "../controllers/postCommentById"
import { postLike } from "../controllers/postLike"
import { postProject } from "../controllers/postProject"
import { postReplyById } from "../controllers/postReplyById"
import { postReplyLike } from "../controllers/postReplyLike"
import { postSession } from "../controllers/postSession"
import { postUser } from "../controllers/postUser"
import { getUsers } from "../controllers/getUsers"
import { patchUser } from "../controllers/patchUser"
import {
  createInvitationLink,
  validateInvitationToken,
  useInvitationToken,
  getInvitationHistory,
} from "../controllers/workspace-invitation"
import {
  postWorkspace,
  getWorkspaces,
  getWorkspaceById,
  patchWorkspace,
  deleteWorkspace,
  getWorkspaceUsers,
} from "../controllers/workspace"
import {
  postTeam,
  getTeams,
  getTeamById,
  patchTeam,
  deleteTeam,
  postTeamMember,
  deleteTeamMember,
  postTeamTeacher,
  deleteTeamTeacher,
  postTeamClass,
  deleteTeamClass,
} from "../controllers/team"

const router = express.Router()

// ALTERNATIVE DOCUMENTATION
router.get("/alt/doc", getHome)

// WORKSPACES
router.post("/workspace", authenticateUser, postWorkspace)
router.get("/workspaces", authenticateUser, getWorkspaces)
router.get("/workspace/:workspaceId", authenticateUser, getWorkspaceById)
router.patch("/workspace/:workspaceId", authenticateUser, patchWorkspace)
router.delete("/workspace/:workspaceId", authenticateUser, deleteWorkspace)
router.get("/workspace/:workspaceId/users", authenticateUser, getWorkspaceUsers)

// CLASSES
router.get("/classes", authenticateUser, getClasses)
router.get("/classes/:classId", authenticateUser, getClassById)
router.post("/classes", postClass)
router.patch("/classes/:classId", authenticateUser, patchClass)
router.delete("/classes/:classId", authenticateUser, deleteClass)

// PROJECTS
router.get("/classes/:classId/projects", authenticateUser, getProjects)
router.get("/classes/projects/with-comments", authenticateUser, getProjectsWithComments)
router.get("/projects/:projectId", authenticateUser, getProjectById)
router.post(
  "/classes/:classId/projects",
  uploadVideo.single("video"),
  authenticateUser,
  postProject
)
router.patch("/projects/:projectId", authenticateUser, patchProject)
router.delete("/projects/:projectId", authenticateUser, deleteProject)

// COMMENTS
router.get("/projects/:projectId/comments", getComments)
router.get("/comments/all", authenticateUser, getAllComments)
router.get("/comments/:commentId", getCommentById)
router.get("/projects/:projectId/comments/private", authenticateUser, getPrivateComments)
router.post("/projects/:projectId/comments", authenticateUser, postCommentById)
router.patch("/comments/:commentId", authenticateUser, patchComment)
router.patch("/comments/:commentId/toggle-check", authenticateUser, patchIsChecked)
router.delete("/comments/:commentId", authenticateUser, deleteComment)

// REPLIES
router.get("/comments/:commentId/replies", getReplies)
router.post("/comments/:commentId/replies", authenticateUser, postReplyById)
router.patch("/replies/:replyId", authenticateUser, patchReply)
router.delete("/replies/:replyId", authenticateUser, deleteReply)

// LIKES
router.post("/comments/:commentId/likes", authenticateUser, postLike)
router.post("/replies/:replyId/likes", authenticateUser, postReplyLike)

// USERS & AUTHENTICATION
router.post("/users", uploadImage.single("image"), postUser)
router.delete("/users/:userId", authenticateUser, deleteUser)
router.patch("/users/:userId", authenticateUser, patchUser)
router.post("/session", postSession)
router.get("/users", getUsers)

// WORKSPACE INVITATIONS
router.post("/workspace/:workspaceId/invite", authenticateUser, createInvitationLink)
router.get("/invitation/validate/:token", validateInvitationToken)
router.post("/invitation/use", authenticateUser, useInvitationToken)
router.get("/workspace/:workspaceId/invitations", authenticateUser, getInvitationHistory)

// TEAMS
router.post("/teams", authenticateUser, postTeam)
router.get("/teams", authenticateUser, getTeams)
router.get("/teams/:teamId", authenticateUser, getTeamById)
router.patch("/teams/:teamId", authenticateUser, patchTeam)
router.delete("/teams/:teamId", authenticateUser, deleteTeam)
router.post("/teams/:teamId/members", authenticateUser, postTeamMember)
router.delete("/teams/:teamId/members/:userId", authenticateUser, deleteTeamMember)
router.post("/teams/:teamId/teachers", authenticateUser, postTeamTeacher)
router.delete("/teams/:teamId/teachers/:userId", authenticateUser, deleteTeamTeacher)
router.post("/teams/:teamId/classes", authenticateUser, postTeamClass)
router.delete("/teams/:teamId/classes/:classId", authenticateUser, deleteTeamClass)

export default router
