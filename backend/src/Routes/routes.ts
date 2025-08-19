import express from "express"
import { authenticateUser } from "../middleware/authenticateUser"
import { uploadVideo } from "../middleware/uploadVideo"
import { uploadImage } from "../middleware/uploadImage"

import { deleteComment } from "../controllers/deleteComment"
import { deleteProject } from "../controllers/deleteProject"
import { deleteReply } from "../controllers/deleteReply"
import { getCommentById } from "../controllers/getCommentById"
import { getComments } from "../controllers/getComments"
import { getHome } from "../controllers/getHome"
import { getProjectById } from "../controllers/getProjectById"
import { getProjects } from "../controllers/getProjects"
import { getReplies } from "../controllers/getReplies"
import { patchReply } from "../controllers/patchReply"
import { patchComment } from "../controllers/patchComment"
import { patchIsChecked } from "../controllers/patchIsChecked"
import { postCommentById } from "../controllers/postCommentById"
import { postClass } from "../controllers/postClass"
import { postProject } from "../controllers/postProject"
import { postReplyById } from "../controllers/postReplyById"
import { postUser } from "../controllers/postUser"
import { postSession } from "../controllers/postSession"
import { getAllComments } from "../controllers/getAllComments"
import { getProjectsWithComments } from "../controllers/getProjectsWithComments"
import { getPrivateComments } from "../controllers/getPrivateComments"
import { deleteClass } from "../controllers/deleteClass"
import { getClasses } from "../controllers/getClasses"
import { getClassById } from "../controllers/getClassById"
import { postLike } from "../controllers/postLike"
import { postReplyLike } from "../controllers/postReplyLike"
import { patchProject } from "../controllers/patchProjects"
import { patchClass } from "../controllers/patchClass"
import { deleteUser } from "../controllers/deleteUser"

const router = express.Router()

// Home
router.get("/alt/doc", getHome)

//Classes
router.get("/classes", authenticateUser, getClasses)
router.get("/classes/:classId", authenticateUser, getClassById)

//projects
router.get("/classes/:classId/projects", authenticateUser, getProjects)
router.get(
  "/classes/projects/with-comments",
  authenticateUser,
  getProjectsWithComments
)
router.get("/projects/:projectId", authenticateUser, getProjectById)

// Comments
router.get("/projects/:projectId/comments", getComments)
router.get("/comments/all", authenticateUser, getAllComments)
router.get("/comments/:commentId", getCommentById)
router.get(
  "/projects/:projectId/comments/private",
  authenticateUser,
  getPrivateComments
)

// Replies
router.get("/comments/:commentId/replies", getReplies)

// Posting
router.post("/classes", postClass)
router.post(
  "/classes/:classId/projects",
  uploadVideo.single("video"),
  authenticateUser,
  postProject
)
router.post("/projects/:projectId/comments", authenticateUser, postCommentById)
router.post("/comments/:commentId/replies", authenticateUser, postReplyById)
router.post("/user", uploadImage.single("image"), postUser)
router.post("/comments/:commentId/likes", authenticateUser, postLike)
router.post("/replies/:replyId/likes", authenticateUser, postReplyLike)
router.post("/session", postSession)

// Patch
router.patch("/classes/:classId", authenticateUser, patchClass)
router.patch("/projects/:projectId", authenticateUser, patchProject)
router.patch("/replies/:replyId", authenticateUser, patchReply)
router.patch("/comments/:commentId", authenticateUser, patchComment)
router.patch(
  "/comments/:commentId/toggle-check",
  authenticateUser,
  patchIsChecked
)

// Delete
router.delete("/classes/:classId", authenticateUser, deleteClass)
router.delete("/projects/:projectId", authenticateUser, deleteProject)
router.delete("/comments/:commentId", authenticateUser, deleteComment)
router.delete("/replies/:replyId", authenticateUser, deleteReply)
router.delete("/user/:userId", authenticateUser, deleteUser)

export default router
