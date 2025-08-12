import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { setupSwagger } from "./swagger/swagger";

import { authenticateUser } from "./src/middleware/authenticateUser";
import { resetDatabase } from "./src/setup/resetDatabase";
import { uploadVideo } from "./src/middleware/uploadVideo";
import { uploadImage } from "./src/middleware/uploadImage";

import { deleteComment } from "./src/controllers/deleteComment";
import { deleteProject } from "./src/controllers/deleteProject";
import { deleteReply } from "./src/controllers/deleteReply";
import { getCommentById } from "./src/controllers/getCommentById";
import { getComments } from "./src/controllers/getComments";
import { getHome } from "./src/controllers/getHome";
import { getProjectById } from "./src/controllers/getProjectById";
import { getProjects } from "./src/controllers/getProjects";
import { getReplies } from "./src/controllers/getReplies";
import { patchReply } from "./src/controllers/patchReply";
import { patchComment } from "./src/controllers/patchComment";
import { patchIsChecked } from "./src/controllers/patchIsChecked";
import { postCommentById } from "./src/controllers/postCommentById";
import { postClass } from "./src/controllers/postClass";
import { postProject } from "./src/controllers/postProject";
import { postReplyById } from "./src/controllers/postReplyById";
import { postUser } from "./src/controllers/postUser";
import { postSession } from "./src/controllers/postSession";
import { getAllComments } from "./src/controllers/getAllComments";
import { getProjectsWithComments } from "./src/controllers/getProjectsWithComments";
import { getPrivateComments } from "./src/controllers/getPrivateComments";
import { deleteClass } from "./src/controllers/deleteClass";
import { getClasses } from "./src/controllers/getClasses";
import { getClassById } from "./src/controllers/getClassById";
import { postLike } from "./src/controllers/postLike";
import { postReplyLike } from "./src/controllers/postReplyLike";

const mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose.connect(mongoUrl);

const port: number = parseInt(process.env.PORT || "8080");
const app: Application = express();

app.use(express.static("public"));

const allowedOrigins = [
  "http://localhost:5173",           // your local dev
  "https://class-review.netlify.app" // your deployed frontend
];

// First, parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Then, configure CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow curl/postman with no origin
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false); // silently fail without throwing error
      // or you can do callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle OPTIONS preflight requests
app.options("*", cors());

resetDatabase();

// API Home Route
// Home + Projects
app.get("/alt/doc", getHome(app));
app.get("/classes", authenticateUser, getClasses);
app.get("/classes/:classId", authenticateUser, getClassById);
app.get("/classes/:classId/projects", authenticateUser, getProjects);
app.get("/classes/projects/with-comments", authenticateUser, getProjectsWithComments);
app.get("/projects/:projectId", authenticateUser, getProjectById);

// Comments
app.get("/projects/:projectId/comments", getComments);
app.get("/comments/all", authenticateUser, getAllComments);
app.get("/comments/:commentId", getCommentById);
app.get("/projects/:projectId/comments/private", authenticateUser, getPrivateComments);

// Replies
app.get("/comments/:commentId/replies", getReplies);

// Posting
app.post("/classes", postClass);
app.post("/classes/:classId/projects", uploadVideo.single("video"), authenticateUser, postProject);
app.post("/projects/:projectId/comments", authenticateUser, postCommentById);
app.post("/comments/:commentId/replies", authenticateUser, postReplyById);
app.post("/user", uploadImage.single("image"), postUser);
app.post("/comments/:commentId/likes", authenticateUser, postLike);
app.post("/replies/:replyId/likes", authenticateUser, postReplyLike);
app.post("/session", postSession);

// Patch
app.patch("/replies/:replyId", authenticateUser, patchReply);
app.patch("/comments/:commentId", authenticateUser, patchComment);
app.patch("/comments/:commentId/toggle-check", authenticateUser, patchIsChecked);

// Delete
app.delete("/classes/:classId", authenticateUser, deleteClass);
app.delete("/projects/:projectId", authenticateUser, deleteProject);
app.delete("/comments/:commentId", authenticateUser, deleteComment);
app.delete("/replies/:replyId", authenticateUser, deleteReply);

//This is a documentation helper
// /api-docs/ for a endpoint
setupSwagger(app);

// Start the server
app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`);
});