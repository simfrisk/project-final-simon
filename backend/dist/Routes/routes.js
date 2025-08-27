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
const router = express_1.default.Router();
// DOCUMENTATION
router.get("/alt/doc", getHome_1.getHome);
// CLASSES
router.get("/classes", authenticateUser_1.authenticateUser, getClasses_1.getClasses);
router.get("/classes/:classId", authenticateUser_1.authenticateUser, getClassById_1.getClassById);
router.post("/classes", postClass_1.postClass);
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
router.delete("/users/:userId", authenticateUser_1.authenticateUser, deleteUser_1.deleteUser);
router.post("/session", postSession_1.postSession);
exports.default = router;
