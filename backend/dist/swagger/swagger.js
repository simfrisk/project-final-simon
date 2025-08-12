"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Classymc API",
            version: "1.0.0",
            description: "API documentation for your Classync",
        },
        servers: [
            {
                url: process.env.API_URL || "http://localhost:8080",
            },
        ],
        components: {
            schemas: {
                Class: {
                    type: "object",
                    required: ["classTitle"],
                    properties: {
                        classTitle: { type: "string", example: "Math 101" },
                        projects: {
                            type: "array",
                            items: { type: "string", format: "ObjectId", description: "Project ID" },
                        },
                    },
                },
                Comment: {
                    type: "object",
                    required: ["content", "projectId", "commentCreatedBy", "commentType"],
                    properties: {
                        content: { type: "string", example: "This is a comment." },
                        projectId: { type: "string", format: "ObjectId", description: "Project ID" },
                        createdAt: { type: "string", format: "date-time", example: "2023-01-01T12:00:00Z" },
                        timeStamp: { type: "string", nullable: true },
                        isChecked: { type: "boolean", example: false },
                        replies: {
                            type: "array",
                            items: { type: "string", format: "ObjectId", description: "Reply ID" },
                        },
                        commentCreatedBy: { type: "string", format: "ObjectId", description: "User ID" },
                        commentType: {
                            type: "string",
                            enum: ["question", "public", "private"],
                            example: "public",
                        },
                        likes: {
                            type: "array",
                            items: { type: "string", format: "ObjectId", description: "User ID" },
                        },
                    },
                },
                Project: {
                    type: "object",
                    required: ["classId", "projectName"],
                    properties: {
                        classId: { type: "string", format: "ObjectId", description: "Class ID" },
                        projectName: { type: "string", example: "Final Presentation" },
                        projectDescription: { type: "string", nullable: true },
                        video: { type: "string", nullable: true },
                        thumbnail: { type: "string", nullable: true },
                        comments: {
                            type: "array",
                            items: { type: "string", format: "ObjectId", description: "Comment ID" },
                        },
                    },
                },
                Reply: {
                    type: "object",
                    required: ["content", "commentId", "isChecked", "replyCreatedBy"],
                    properties: {
                        content: { type: "string", example: "Nice reply!" },
                        commentId: { type: "string", format: "ObjectId", description: "Comment ID" },
                        createdAt: { type: "string", format: "date-time", example: "2023-01-01T12:00:00Z" },
                        isChecked: { type: "boolean", example: false },
                        replyCreatedBy: { type: "string", format: "ObjectId", description: "User ID" },
                        replyLikes: {
                            type: "array",
                            items: { type: "string", format: "ObjectId", description: "User ID" },
                        },
                    },
                },
                User: {
                    type: "object",
                    required: ["name", "email", "password", "role"],
                    properties: {
                        _id: { type: "string", format: "ObjectId", example: "64d0b2bde5d8f25a1e8d9f67" },
                        name: { type: "string", example: "John Doe" },
                        email: { type: "string", format: "email", example: "john@example.com" },
                        password: { type: "string", example: "hashedpassword123" },
                        role: { type: "string", example: "teacher" },
                        profileImage: {
                            type: "string",
                            example: "https://res.cloudinary.com/dgr7l5nsx/image/upload/w_100,h_100,c_fill/v1754899421/profile_pictures/wtvbkvjnxrbdzfvjcmbi.png",
                        },
                        accessToken: { type: "string" },
                        likedComments: {
                            type: "array",
                            items: { type: "string", format: "ObjectId" },
                        },
                        likedReplies: {
                            type: "array",
                            items: { type: "string", format: "ObjectId" },
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/controllers/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function setupSwagger(app) {
    app.use("/", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
}
