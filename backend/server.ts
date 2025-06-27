import express, { Application, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { getHome } from "./endpoints/getHome";
import { getProjects } from "./endpoints/getProjects";
import { postProject } from "./endpoints/postProject";
import { resetDatabase } from "./setup/resetDatabase";
import { getProjectById } from "./endpoints/getProjectById";
import { postCommentById } from "./endpoints/postCommentById";
import { getComments } from "./endpoints/getComments";
import { getReplyById } from "./endpoints/getReplyById";

const mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose.connect(mongoUrl);

const port: number = parseInt(process.env.PORT || "8080");
const app: Application = express();

app.use(cors());
app.use(express.json());

resetDatabase()

// API Home Route
app.get("/", getHome(app));
app.get("/projects", getProjects);
app.get("/projects/:projectId", getProjectById)
app.get("/projects/:projectId/comments", getComments)
app.get("/projects/:projectId/comments/:commentId/replies", getReplyById)
app.post("/projects", postProject)
app.post("/projects/:projectId/comments/", postCommentById)
// app.post("/projects/:projectId/comments/:commentId/replies/:replyId", postReplyById);

// Start the server
app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`);
});