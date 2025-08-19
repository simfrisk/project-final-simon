"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateUser_1 = require("../middleware/authenticateUser");
const uploadVideo_1 = require("../middleware/uploadVideo");
const uploadImage_1 = require("../middleware/uploadImage");
const deleteComment_1 = require("../controllers/deleteComment");
const deleteProject_1 = require("../controllers/deleteProject");
const deleteReply_1 = require("../controllers/deleteReply");
const getCommentById_1 = require("../controllers/getCommentById");
const getComments_1 = require("../controllers/getComments");
const getHome_1 = require("../controllers/getHome");
const getProjectById_1 = require("../controllers/getProjectById");
const getProjects_1 = require("../controllers/getProjects");
const getReplies_1 = require("../controllers/getReplies");
const patchReply_1 = require("../controllers/patchReply");
const patchComment_1 = require("../controllers/patchComment");
const patchIsChecked_1 = require("../controllers/patchIsChecked");
const postCommentById_1 = require("../controllers/postCommentById");
const postClass_1 = require("../controllers/postClass");
const postProject_1 = require("../controllers/postProject");
const postReplyById_1 = require("../controllers/postReplyById");
const postUser_1 = require("../controllers/postUser");
const postSession_1 = require("../controllers/postSession");
const getAllComments_1 = require("../controllers/getAllComments");
const getProjectsWithComments_1 = require("../controllers/getProjectsWithComments");
const getPrivateComments_1 = require("../controllers/getPrivateComments");
const deleteClass_1 = require("../controllers/deleteClass");
const getClasses_1 = require("../controllers/getClasses");
const getClassById_1 = require("../controllers/getClassById");
const postLike_1 = require("../controllers/postLike");
const postReplyLike_1 = require("../controllers/postReplyLike");
const patchProjects_1 = require("../controllers/patchProjects");
const patchClass_1 = require("../controllers/patchClass");
const deleteUser_1 = require("../controllers/deleteUser");
const router = express_1.default.Router();
// Home
router.get("/alt/doc", getHome_1.getHome);
//Classes
router.get("/classes", authenticateUser_1.authenticateUser, getClasses_1.getClasses);
router.get("/classes/:classId", authenticateUser_1.authenticateUser, getClassById_1.getClassById);
//projects
router.get("/classes/:classId/projects", authenticateUser_1.authenticateUser, getProjects_1.getProjects);
router.get("/classes/projects/with-comments", authenticateUser_1.authenticateUser, getProjectsWithComments_1.getProjectsWithComments);
router.get("/projects/:projectId", authenticateUser_1.authenticateUser, getProjectById_1.getProjectById);
// Comments
router.get("/projects/:projectId/comments", getComments_1.getComments);
router.get("/comments/all", authenticateUser_1.authenticateUser, getAllComments_1.getAllComments);
router.get("/comments/:commentId", getCommentById_1.getCommentById);
router.get("/projects/:projectId/comments/private", authenticateUser_1.authenticateUser, getPrivateComments_1.getPrivateComments);
// Replies
router.get("/comments/:commentId/replies", getReplies_1.getReplies);
// Posting
router.post("/classes", postClass_1.postClass);
router.post("/classes/:classId/projects", uploadVideo_1.uploadVideo.single("video"), authenticateUser_1.authenticateUser, postProject_1.postProject);
router.post("/projects/:projectId/comments", authenticateUser_1.authenticateUser, postCommentById_1.postCommentById);
router.post("/comments/:commentId/replies", authenticateUser_1.authenticateUser, postReplyById_1.postReplyById);
router.post("/user", uploadImage_1.uploadImage.single("image"), postUser_1.postUser);
router.post("/comments/:commentId/likes", authenticateUser_1.authenticateUser, postLike_1.postLike);
router.post("/replies/:replyId/likes", authenticateUser_1.authenticateUser, postReplyLike_1.postReplyLike);
router.post("/session", postSession_1.postSession);
// Patch
router.patch("/classes/:classId", authenticateUser_1.authenticateUser, patchClass_1.patchClass);
router.patch("/projects/:projectId", authenticateUser_1.authenticateUser, patchProjects_1.patchProject);
router.patch("/replies/:replyId", authenticateUser_1.authenticateUser, patchReply_1.patchReply);
router.patch("/comments/:commentId", authenticateUser_1.authenticateUser, patchComment_1.patchComment);
router.patch("/comments/:commentId/toggle-check", authenticateUser_1.authenticateUser, patchIsChecked_1.patchIsChecked);
// Delete
router.delete("/classes/:classId", authenticateUser_1.authenticateUser, deleteClass_1.deleteClass);
router.delete("/projects/:projectId", authenticateUser_1.authenticateUser, deleteProject_1.deleteProject);
router.delete("/comments/:commentId", authenticateUser_1.authenticateUser, deleteComment_1.deleteComment);
router.delete("/replies/:replyId", authenticateUser_1.authenticateUser, deleteReply_1.deleteReply);
router.delete("/user/:userId", authenticateUser_1.authenticateUser, deleteUser_1.deleteUser);
exports.default = router;
