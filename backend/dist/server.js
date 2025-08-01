"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const authenticateUser_1 = require("./middleware/authenticateUser");
const resetDatabase_1 = require("./setup/resetDatabase");
const uploadVideo_1 = require("./middleware/uploadVideo");
const uploadImage_1 = require("./middleware/uploadImage");
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
const patchIsChecked_1 = require("./endpoints/patchIsChecked");
const postCommentById_1 = require("./endpoints/postCommentById");
const postProject_1 = require("./endpoints/postProject");
const postReplyById_1 = require("./endpoints/postReplyById");
const postUser_1 = require("./endpoints/postUser");
const postSession_1 = require("./endpoints/postSession");
const getAllComments_1 = require("./endpoints/getAllComments");
const getProjectsWithComments_1 = require("./endpoints/getProjectsWithComments");
const getPrivateComments_1 = require("./endpoints/getPrivateComments");
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose_1.default.connect(mongoUrl);
const port = parseInt(process.env.PORT || "8080");
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:5173", // your local dev
    "https://class-review.netlify.app" // your deployed frontend
];
// First, parse incoming request bodies
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Then, configure CORS
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true); // allow curl/postman with no origin
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(null, false); // silently fail without throwing error
            // or you can do callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Handle OPTIONS preflight requests
app.options("*", (0, cors_1.default)());
(0, resetDatabase_1.resetDatabase)();
// API Home Route
// Home + Projects
app.get("/", (0, getHome_1.getHome)(app));
app.get("/projects", authenticateUser_1.authenticateUser, getProjects_1.getProjects);
app.get("/projects/with-comments", authenticateUser_1.authenticateUser, getProjectsWithComments_1.getProjectsWithComments);
app.get("/projects/:projectId", authenticateUser_1.authenticateUser, getProjectById_1.getProjectById);
// Comments
app.get("/projects/:projectId/comments", getComments_1.getComments);
app.get("/comments/all", authenticateUser_1.authenticateUser, getAllComments_1.getAllComments);
app.get("/comments/:commentId", getCommentById_1.getCommentById);
app.get("/projects/:projectId/comments/private", authenticateUser_1.authenticateUser, getPrivateComments_1.getPrivateComments);
// Replies
app.get("/comments/:commentId/replies", getReplies_1.getReplies);
// Posting
app.post("/projects", uploadVideo_1.uploadVideo.single("video"), postProject_1.postProject);
app.post("/projects/:projectId/comments/", authenticateUser_1.authenticateUser, postCommentById_1.postCommentById);
app.post("/comments/:commentId/replies/", authenticateUser_1.authenticateUser, postReplyById_1.postReplyById);
app.post("/user", uploadImage_1.uploadImage.single("image"), postUser_1.postUser);
app.post("/session", postSession_1.postSession);
// Patch
app.patch("/replies/:replyId", authenticateUser_1.authenticateUser, patchReply_1.patchReply);
app.patch("/comments/:commentId/toggle-check", authenticateUser_1.authenticateUser, patchIsChecked_1.patchIsChecked);
// Delete
app.delete("/projects/:projectId", authenticateUser_1.authenticateUser, deleteProject_1.deleteProject);
app.delete("/comments/:commentId", authenticateUser_1.authenticateUser, deleteComment_1.deleteComment);
app.delete("/replies/:replyId", authenticateUser_1.authenticateUser, deleteReply_1.deleteReply);
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
