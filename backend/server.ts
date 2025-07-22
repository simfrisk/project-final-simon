import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import mongoose from "mongoose";

import { authenticateUser } from "./middleware/authenticateUser";
import { resetDatabase } from "./setup/resetDatabase";
import { uploadVideo } from "./middleware/uploadVideo";

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
import { postCommentById } from "./endpoints/postCommentById";
import { postProject } from "./endpoints/postProject";
import { postReplyById } from "./endpoints/postReplyById";
import { postUser } from "./endpoints/postUser";
import { postSession } from "./endpoints/postSession";

import { directUpload } from "./test";


const mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose.connect(mongoUrl);

const port: number = parseInt(process.env.PORT || "8080");
const app: Application = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors()); // handles preflight requests

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- add this line

resetDatabase();

// API Home Route
// Home + Projects
app.get("/", getHome(app));
app.get("/projects", authenticateUser, getProjects);
app.get("/projects/:projectId", getProjectById);

// Comments
app.get("/projects/:projectId/comments", getComments); // All comments for a project
app.get("/comments/:commentId", getCommentById);       // Single comment by ID

// Replies
app.get("/comments/:commentId/replies", getReplies);   // Replies for a comment

// Posting
app.post("/projects", uploadVideo.single("video"), postProject);
// app.post("/projects", postProject);
app.post("/projects/:projectId/comments/", postCommentById);
app.post("/comments/:commentId/replies/", postReplyById);
app.post("/user", postUser)
app.post("/session", postSession)

// Patch
app.patch("/replies/:replyId", patchReply);

// Delete
app.delete("/projects/:projectId", deleteProject)
app.delete("/comments/:commentId", deleteComment)
app.delete("/replies/:replyId", deleteReply);

app.post("/upload-direct", directUpload);

app.post("/test-upload", (req, res) => {
  uploadVideo.single("video")(req, res, (err) => {
    if (err) {
      console.error("Multer upload error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
    console.log("File received:", req.file);
    console.log("Body logs:", req.body);
    res.json({ success: true, file: req.file, body: req.body });
  });
});

// Start the server
app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`);
});