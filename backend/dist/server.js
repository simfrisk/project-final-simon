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
const resetDatabase_1 = require("./setup/resetDatabase");
const routes_1 = __importDefault(require("./Routes/routes"));
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
app.use("/", routes_1.default);
//This is a documentation helper
// /api-docs/ for a endpoint
(0, swagger_1.setupSwagger)(app);
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
