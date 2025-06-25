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
const resetDatabase_1 = require("./setup/resetDatabase");
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose_1.default.connect(mongoUrl);
const port = parseInt(process.env.PORT || "8080");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, resetDatabase_1.resetDatabase)();
// API Home Route
app.get("/", (0, getHome_1.getHome)(app));
app.get("/", getProjects_1.getProjects);
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
