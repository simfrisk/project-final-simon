"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHome = void 0;
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const getHome = (app) => (req, res) => {
    const endpoints = (0, express_list_endpoints_1.default)(app);
    res.json({
        message: "Welcome to the Classymc API",
        endpoints,
    });
};
exports.getHome = getHome;
