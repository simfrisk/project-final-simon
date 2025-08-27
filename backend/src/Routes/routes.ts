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

const router = express.Router()

// ALTERNATIVE DOCUMENTATION
router.get("/alt/doc", getHome)

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
router.post("/session", postSession)
router.get("/users", getUsers)

export default router
