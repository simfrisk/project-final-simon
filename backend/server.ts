import express, { Application } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { authenticateUser } from "./middleware/authenticateUser";
import { resetDatabase } from "./setup/resetDatabase";

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

dotenv.config();

const mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose.connect(mongoUrl);

const port: number = parseInt(process.env.PORT || "8080");
const app: Application = express();

app.use(cors());
app.use(express.json());

resetDatabase()

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
app.post("/projects", postProject);
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

// Start the server
app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`);
});