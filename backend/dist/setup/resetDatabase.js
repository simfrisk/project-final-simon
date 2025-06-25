"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = void 0;
const Projects_1 = require("../models/Projects");
const data_json_1 = __importDefault(require("../data.json"));
const resetDatabase = () => {
    if (process.env.RESET_DB) {
        const seedDatabase = async () => {
            console.log("🌱 Resetting and seeding database...");
            await Projects_1.Project.deleteMany({});
            data_json_1.default.forEach(project => {
                new Projects_1.Project(project).save();
            });
            console.log("✅ Seeding complete.");
        };
        seedDatabase();
    }
};
exports.resetDatabase = resetDatabase;
