"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = void 0;
const Projects_1 = require("../models/Projects");
const getProjects = async (req, res) => {
    try {
        let result = await Projects_1.Project.find();
        res.json(result);
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects." });
    }
};
exports.getProjects = getProjects;
