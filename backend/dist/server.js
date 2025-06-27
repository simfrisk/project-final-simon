"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const getHome_1 = require("./endpoints/getHome");
const getProjects_1 = require("./endpoints/getProjects");
const postProject_1 = require("./endpoints/postProject");
const resetDatabase_1 = require("./setup/resetDatabase");
const getProjectById_1 = require("./endpoints/getProjectById");
const postCommentById_1 = require("./endpoints/postCommentById");
const getComments_1 = require("./endpoints/getComments");
const getReplyById_1 = require("./endpoints/getReplyById");
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose_1.default.connect(mongoUrl);
const port = parseInt(process.env.PORT || "8080");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, resetDatabase_1.resetDatabase)();
// API Home Route
app.get("/", (0, getHome_1.getHome)(app));
app.get("/projects", getProjects_1.getProjects);
app.get("/projects/:projectId", getProjectById_1.getProjectById);
app.get("/projects/:projectId/comments", getComments_1.getComments);
app.get("/projects/:projectId/comments/:commentId/replies", getReplyById_1.getReplyById);
app.post("/projects", postProject_1.postProject);
app.post("/projects/:projectId/comments/", postCommentById_1.postCommentById);
// app.post("/projects/:projectId/comments/:commentId/replies/:replyId", postReplyById);
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
