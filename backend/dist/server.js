"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const authenticateUser_1 = require("./middleware/authenticateUser");
const resetDatabase_1 = require("./setup/resetDatabase");
const uploadVideo_1 = require("./middleware/uploadVideo");
const deleteComment_1 = require("./endpoints/deleteComment");
const deleteProject_1 = require("./endpoints/deleteProject");
const deleteReply_1 = require("./endpoints/deleteReply");
const getCommentById_1 = require("./endpoints/getCommentById");
const getComments_1 = require("./endpoints/getComments");
const getHome_1 = require("./endpoints/getHome");
const getProjectById_1 = require("./endpoints/getProjectById");
const getProjects_1 = require("./endpoints/getProjects");
const getReplies_1 = require("./endpoints/getReplies");
const patchReply_1 = require("./endpoints/patchReply");
const postCommentById_1 = require("./endpoints/postCommentById");
const postProject_1 = require("./endpoints/postProject");
const postReplyById_1 = require("./endpoints/postReplyById");
const postUser_1 = require("./endpoints/postUser");
const postSession_1 = require("./endpoints/postSession");
dotenv_1.default.config();
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose_1.default.connect(mongoUrl);
const port = parseInt(process.env.PORT || "8080");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // replace with your frontend URL
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", (0, cors_1.default)()); // handles preflight requests
app.use(express_1.default.json());
(0, resetDatabase_1.resetDatabase)();
// API Home Route
// Home + Projects
app.get("/", (0, getHome_1.getHome)(app));
app.get("/projects", authenticateUser_1.authenticateUser, getProjects_1.getProjects);
app.get("/projects/:projectId", getProjectById_1.getProjectById);
// Comments
app.get("/projects/:projectId/comments", getComments_1.getComments); // All comments for a project
app.get("/comments/:commentId", getCommentById_1.getCommentById); // Single comment by ID
// Replies
app.get("/comments/:commentId/replies", getReplies_1.getReplies); // Replies for a comment
// Posting
app.post("/projects", uploadVideo_1.uploadVideo.single("video"), postProject_1.postProject);
// app.post("/projects", postProject);
app.post("/projects/:projectId/comments/", postCommentById_1.postCommentById);
app.post("/comments/:commentId/replies/", postReplyById_1.postReplyById);
app.post("/user", postUser_1.postUser);
app.post("/session", postSession_1.postSession);
// Patch
app.patch("/replies/:replyId", patchReply_1.patchReply);
// Delete
app.delete("/projects/:projectId", deleteProject_1.deleteProject);
app.delete("/comments/:commentId", deleteComment_1.deleteComment);
app.delete("/replies/:replyId", deleteReply_1.deleteReply);
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
