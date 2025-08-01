import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import mongoose from "mongoose";

import { authenticateUser } from "./middleware/authenticateUser";
import { resetDatabase } from "./setup/resetDatabase";
import { uploadVideo } from "./middleware/uploadVideo";
import { uploadImage } from "./middleware/uploadImage";

import { deleteComment } from "./endpoints/deleteComment";
import { deleteProject } from "./endpoints/deleteProject";
import { deleteReply } from "./endpoints/deleteReply";
import { getCommentById } from "./endpoints/getCommentById";
import { getComments } from "./endpoints/getComments";
import { getHome } from "./endpoints/getHome";
import { getProjectById } from "./endpoints/getProjectById";
import { getProjects } from "./endpoints/getProjects";
import { getReplies } from "./endpoints/getReplies";
import { patchReply } from "./endpoints/patchReply";
import { patchIsChecked } from "./endpoints/patchIsChecked";
import { postCommentById } from "./endpoints/postCommentById";
import { postProject } from "./endpoints/postProject";
import { postReplyById } from "./endpoints/postReplyById";
import { postUser } from "./endpoints/postUser";
import { postSession } from "./endpoints/postSession";
import { getAllComments } from "./endpoints/getAllComments";
import { getProjectsWithComments } from "./endpoints/getProjectsWithComments";
import { getPrivateComments } from "./endpoints/getPrivateComments";

const mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose.connect(mongoUrl);

const port: number = parseInt(process.env.PORT || "8080");
const app: Application = express();

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
app.get("/", getHome(app));
app.get("/projects", authenticateUser, getProjects);
app.get("/projects/with-comments", authenticateUser, getProjectsWithComments);
app.get("/projects/:projectId", authenticateUser, getProjectById);

// Comments
app.get("/projects/:projectId/comments", getComments);
app.get("/comments/all", authenticateUser, getAllComments);
app.get("/comments/:commentId", getCommentById);
app.get("/projects/:projectId/comments/private", authenticateUser, getPrivateComments);

// Replies
app.get("/comments/:commentId/replies", getReplies);

// Posting
app.post("/projects", uploadVideo.single("video"), postProject);
app.post("/projects/:projectId/comments/", authenticateUser, postCommentById);
app.post("/comments/:commentId/replies/", authenticateUser, postReplyById);
app.post("/user", uploadImage.single("image"), postUser);
app.post("/session", postSession);

// Patch
app.patch("/replies/:replyId", authenticateUser, patchReply);
app.patch("/comments/:commentId/toggle-check", authenticateUser, patchIsChecked);

// Delete
app.delete("/projects/:projectId", authenticateUser, deleteProject);
app.delete("/comments/:commentId", authenticateUser, deleteComment);
app.delete("/replies/:replyId", authenticateUser, deleteReply);

// Start the server
app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`);
});