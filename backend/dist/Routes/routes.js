"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateUser_1 = require("../middleware/authenticateUser");
const uploadVideo_1 = require("../middleware/uploadVideo");
const uploadImage_1 = require("../middleware/uploadImage");
// Import controllers
const deleteClass_1 = require("../controllers/deleteClass");
const deleteComment_1 = require("../controllers/deleteComment");
const deleteProject_1 = require("../controllers/deleteProject");
const deleteReply_1 = require("../controllers/deleteReply");
const deleteUser_1 = require("../controllers/deleteUser");
const getAllComments_1 = require("../controllers/getAllComments");
const getClassById_1 = require("../controllers/getClassById");
const getClasses_1 = require("../controllers/getClasses");
const getCommentById_1 = require("../controllers/getCommentById");
const getComments_1 = require("../controllers/getComments");
const getHome_1 = require("../controllers/getHome");
const getPrivateComments_1 = require("../controllers/getPrivateComments");
const getProjectById_1 = require("../controllers/getProjectById");
const getProjects_1 = require("../controllers/getProjects");
const getProjectsWithComments_1 = require("../controllers/getProjectsWithComments");
const getReplies_1 = require("../controllers/getReplies");
const patchClass_1 = require("../controllers/patchClass");
const patchComment_1 = require("../controllers/patchComment");
const patchIsChecked_1 = require("../controllers/patchIsChecked");
const patchProjects_1 = require("../controllers/patchProjects");
const patchReply_1 = require("../controllers/patchReply");
const postClass_1 = require("../controllers/postClass");
const postCommentById_1 = require("../controllers/postCommentById");
const postLike_1 = require("../controllers/postLike");
const postProject_1 = require("../controllers/postProject");
const postReplyById_1 = require("../controllers/postReplyById");
const postReplyLike_1 = require("../controllers/postReplyLike");
const postSession_1 = require("../controllers/postSession");
const postUser_1 = require("../controllers/postUser");
const getUsers_1 = require("../controllers/getUsers");
const getUserById_1 = require("../controllers/getUserById");
const patchUser_1 = require("../controllers/patchUser");
const workspace_invitation_1 = require("../controllers/workspace-invitation");
const postWorkspace_1 = require("../controllers/postWorkspace");
const getWorkspaces_1 = require("../controllers/getWorkspaces");
const getWorkspaceById_1 = require("../controllers/getWorkspaceById");
const patchWorkspace_1 = require("../controllers/patchWorkspace");
const deleteWorkspace_1 = require("../controllers/deleteWorkspace");
const getWorkspaceUsers_1 = require("../controllers/getWorkspaceUsers");
const getUserWorkspaces_1 = require("../controllers/getUserWorkspaces");
const postTeam_1 = require("../controllers/postTeam");
const getTeams_1 = require("../controllers/getTeams");
const getTeamById_1 = require("../controllers/getTeamById");
const patchTeam_1 = require("../controllers/patchTeam");
const deleteTeam_1 = require("../controllers/deleteTeam");
const postTeamMember_1 = require("../controllers/postTeamMember");
const deleteTeamMember_1 = require("../controllers/deleteTeamMember");
const postTeamTeacher_1 = require("../controllers/postTeamTeacher");
const deleteTeamTeacher_1 = require("../controllers/deleteTeamTeacher");
const postTeamClass_1 = require("../controllers/postTeamClass");
const deleteTeamClass_1 = require("../controllers/deleteTeamClass");
const exportCommentsToSrt_1 = require("../controllers/exportCommentsToSrt");
const router = express_1.default.Router();
// ALTERNATIVE DOCUMENTATION
router.get("/alt/doc", getHome_1.getHome);
// WORKSPACES
router.post("/workspace", authenticateUser_1.authenticateUser, postWorkspace_1.postWorkspace);
router.get("/workspaces", authenticateUser_1.authenticateUser, getWorkspaces_1.getWorkspaces);
router.get("/workspace/:workspaceId", authenticateUser_1.authenticateUser, getWorkspaceById_1.getWorkspaceById);
router.patch("/workspace/:workspaceId", authenticateUser_1.authenticateUser, patchWorkspace_1.patchWorkspace);
router.delete("/workspace/:workspaceId", authenticateUser_1.authenticateUser, deleteWorkspace_1.deleteWorkspace);
router.get("/workspace/:workspaceId/users", authenticateUser_1.authenticateUser, getWorkspaceUsers_1.getWorkspaceUsers);
router.get("/user/workspaces", authenticateUser_1.authenticateUser, getUserWorkspaces_1.getUserWorkspaces);
// CLASSES
router.get("/workspace/:workspaceId/classes", authenticateUser_1.authenticateUser, getClasses_1.getClasses);
router.get("/classes/:classId", authenticateUser_1.authenticateUser, getClassById_1.getClassById);
router.post("/workspace/:workspaceId/classes", postClass_1.postClass);
router.patch("/classes/:classId", authenticateUser_1.authenticateUser, patchClass_1.patchClass);
router.delete("/classes/:classId", authenticateUser_1.authenticateUser, deleteClass_1.deleteClass);
// PROJECTS
router.get("/classes/:classId/projects", authenticateUser_1.authenticateUser, getProjects_1.getProjects);
router.get("/classes/projects/with-comments", authenticateUser_1.authenticateUser, getProjectsWithComments_1.getProjectsWithComments);
router.get("/projects/:projectId", authenticateUser_1.authenticateUser, getProjectById_1.getProjectById);
router.post("/classes/:classId/projects", uploadVideo_1.uploadVideo.single("video"), authenticateUser_1.authenticateUser, postProject_1.postProject);
router.patch("/projects/:projectId", authenticateUser_1.authenticateUser, patchProjects_1.patchProject);
router.delete("/projects/:projectId", authenticateUser_1.authenticateUser, deleteProject_1.deleteProject);
// COMMENTS
router.get("/projects/:projectId/comments", getComments_1.getComments);
router.get("/comments/all", authenticateUser_1.authenticateUser, getAllComments_1.getAllComments);
router.get("/comments/:commentId", getCommentById_1.getCommentById);
router.get("/projects/:projectId/comments/private", authenticateUser_1.authenticateUser, getPrivateComments_1.getPrivateComments);
router.get("/projects/:projectId/export/srt", authenticateUser_1.authenticateUser, exportCommentsToSrt_1.exportCommentsToSrt);
router.post("/projects/:projectId/comments", authenticateUser_1.authenticateUser, postCommentById_1.postCommentById);
router.patch("/comments/:commentId", authenticateUser_1.authenticateUser, patchComment_1.patchComment);
router.patch("/comments/:commentId/toggle-check", authenticateUser_1.authenticateUser, patchIsChecked_1.patchIsChecked);
router.delete("/comments/:commentId", authenticateUser_1.authenticateUser, deleteComment_1.deleteComment);
// REPLIES
router.get("/comments/:commentId/replies", getReplies_1.getReplies);
router.post("/comments/:commentId/replies", authenticateUser_1.authenticateUser, postReplyById_1.postReplyById);
router.patch("/replies/:replyId", authenticateUser_1.authenticateUser, patchReply_1.patchReply);
router.delete("/replies/:replyId", authenticateUser_1.authenticateUser, deleteReply_1.deleteReply);
// LIKES
router.post("/comments/:commentId/likes", authenticateUser_1.authenticateUser, postLike_1.postLike);
router.post("/replies/:replyId/likes", authenticateUser_1.authenticateUser, postReplyLike_1.postReplyLike);
// USERS & AUTHENTICATION
router.post("/users", uploadImage_1.uploadImage.single("image"), postUser_1.postUser);
router.get("/users/:userId", authenticateUser_1.authenticateUser, getUserById_1.getUserById);
router.delete("/users/:userId", authenticateUser_1.authenticateUser, deleteUser_1.deleteUser);
router.patch("/users/:userId", authenticateUser_1.authenticateUser, patchUser_1.patchUser);
router.post("/session", postSession_1.postSession);
router.get("/users", getUsers_1.getUsers);
// WORKSPACE INVITATIONS
router.post("/workspace/:workspaceId/invite", authenticateUser_1.authenticateUser, workspace_invitation_1.createInvitationLink);
router.post("/workspace/:workspaceId/teams/:teamId/invite", authenticateUser_1.authenticateUser, workspace_invitation_1.createInvitationLink);
router.get("/invitation/validate/:token", workspace_invitation_1.validateInvitationToken);
router.post("/invitation/use", authenticateUser_1.authenticateUser, workspace_invitation_1.useInvitationToken);
router.get("/workspace/:workspaceId/invitations", authenticateUser_1.authenticateUser, workspace_invitation_1.getInvitationHistory);
router.delete("/invitation/:invitationId", authenticateUser_1.authenticateUser, workspace_invitation_1.deleteInvitation);
router.patch("/invitation/:invitationId/deactivate", authenticateUser_1.authenticateUser, workspace_invitation_1.deactivateInvitation);
// TEAMS
router.get("/workspace/:workspaceId/teams", authenticateUser_1.authenticateUser, getTeams_1.getTeams);
router.get("/teams/:teamId", authenticateUser_1.authenticateUser, getTeamById_1.getTeamById);
router.post("/workspace/:workspaceId/teams", authenticateUser_1.authenticateUser, postTeam_1.postTeam);
router.patch("/teams/:teamId", authenticateUser_1.authenticateUser, patchTeam_1.patchTeam);
router.delete("/teams/:teamId", authenticateUser_1.authenticateUser, deleteTeam_1.deleteTeam);
// Team management routes (simplified individual operations)
router.post("/teams/:teamId/members/:userId", authenticateUser_1.authenticateUser, postTeamMember_1.postTeamMember);
router.delete("/teams/:teamId/members/:userId", authenticateUser_1.authenticateUser, deleteTeamMember_1.deleteTeamMember);
router.post("/teams/:teamId/teachers/:userId", authenticateUser_1.authenticateUser, postTeamTeacher_1.postTeamTeacher);
router.delete("/teams/:teamId/teachers/:userId", authenticateUser_1.authenticateUser, deleteTeamTeacher_1.deleteTeamTeacher);
router.post("/teams/:teamId/classes/:classId", authenticateUser_1.authenticateUser, postTeamClass_1.postTeamClass);
router.delete("/teams/:teamId/classes/:classId", authenticateUser_1.authenticateUser, deleteTeamClass_1.deleteTeamClass);
exports.default = router;
