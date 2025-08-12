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
const swagger_1 = require("./swagger/swagger");
const authenticateUser_1 = require("./src/middleware/authenticateUser");
const resetDatabase_1 = require("./src/setup/resetDatabase");
const uploadVideo_1 = require("./src/middleware/uploadVideo");
const uploadImage_1 = require("./src/middleware/uploadImage");
const deleteComment_1 = require("./src/controllers/deleteComment");
const deleteProject_1 = require("./src/controllers/deleteProject");
const deleteReply_1 = require("./src/controllers/deleteReply");
const getCommentById_1 = require("./src/controllers/getCommentById");
const getComments_1 = require("./src/controllers/getComments");
const getHome_1 = require("./src/controllers/getHome");
const getProjectById_1 = require("./src/controllers/getProjectById");
const getProjects_1 = require("./src/controllers/getProjects");
const getReplies_1 = require("./src/controllers/getReplies");
const patchReply_1 = require("./src/controllers/patchReply");
const patchComment_1 = require("./src/controllers/patchComment");
const patchIsChecked_1 = require("./src/controllers/patchIsChecked");
const postCommentById_1 = require("./src/controllers/postCommentById");
const postClass_1 = require("./src/controllers/postClass");
const postProject_1 = require("./src/controllers/postProject");
const postReplyById_1 = require("./src/controllers/postReplyById");
const postUser_1 = require("./src/controllers/postUser");
const postSession_1 = require("./src/controllers/postSession");
const getAllComments_1 = require("./src/controllers/getAllComments");
const getProjectsWithComments_1 = require("./src/controllers/getProjectsWithComments");
const getPrivateComments_1 = require("./src/controllers/getPrivateComments");
const deleteClass_1 = require("./src/controllers/deleteClass");
const getClasses_1 = require("./src/controllers/getClasses");
const getClassById_1 = require("./src/controllers/getClassById");
const postLike_1 = require("./src/controllers/postLike");
const postReplyLike_1 = require("./src/controllers/postReplyLike");
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose_1.default.connect(mongoUrl);
const port = parseInt(process.env.PORT || "8080");
const app = (0, express_1.default)();
app.use(express_1.default.static("public"));
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
app.get("/alt/doc", (0, getHome_1.getHome)(app));
app.get("/classes", authenticateUser_1.authenticateUser, getClasses_1.getClasses);
app.get("/classes/:classId", authenticateUser_1.authenticateUser, getClassById_1.getClassById);
app.get("/classes/:classId/projects", authenticateUser_1.authenticateUser, getProjects_1.getProjects);
app.get("/classes/projects/with-comments", authenticateUser_1.authenticateUser, getProjectsWithComments_1.getProjectsWithComments);
app.get("/projects/:projectId", authenticateUser_1.authenticateUser, getProjectById_1.getProjectById);
// Comments
app.get("/projects/:projectId/comments", getComments_1.getComments);
app.get("/comments/all", authenticateUser_1.authenticateUser, getAllComments_1.getAllComments);
app.get("/comments/:commentId", getCommentById_1.getCommentById);
app.get("/projects/:projectId/comments/private", authenticateUser_1.authenticateUser, getPrivateComments_1.getPrivateComments);
// Replies
app.get("/comments/:commentId/replies", getReplies_1.getReplies);
// Posting
app.post("/classes", postClass_1.postClass);
app.post("/classes/:classId/projects", uploadVideo_1.uploadVideo.single("video"), authenticateUser_1.authenticateUser, postProject_1.postProject);
app.post("/projects/:projectId/comments", authenticateUser_1.authenticateUser, postCommentById_1.postCommentById);
app.post("/comments/:commentId/replies", authenticateUser_1.authenticateUser, postReplyById_1.postReplyById);
app.post("/user", uploadImage_1.uploadImage.single("image"), postUser_1.postUser);
app.post("/comments/:commentId/likes", authenticateUser_1.authenticateUser, postLike_1.postLike);
app.post("/replies/:replyId/likes", authenticateUser_1.authenticateUser, postReplyLike_1.postReplyLike);
app.post("/session", postSession_1.postSession);
// Patch
app.patch("/replies/:replyId", authenticateUser_1.authenticateUser, patchReply_1.patchReply);
app.patch("/comments/:commentId", authenticateUser_1.authenticateUser, patchComment_1.patchComment);
app.patch("/comments/:commentId/toggle-check", authenticateUser_1.authenticateUser, patchIsChecked_1.patchIsChecked);
// Delete
app.delete("/classes/:classId", authenticateUser_1.authenticateUser, deleteClass_1.deleteClass);
app.delete("/projects/:projectId", authenticateUser_1.authenticateUser, deleteProject_1.deleteProject);
app.delete("/comments/:commentId", authenticateUser_1.authenticateUser, deleteComment_1.deleteComment);
app.delete("/replies/:replyId", authenticateUser_1.authenticateUser, deleteReply_1.deleteReply);
//This is a documentation helper
// /api-docs/ for a endpoint
(0, swagger_1.setupSwagger)(app);
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
