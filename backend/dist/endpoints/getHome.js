"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHome = void 0;
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const BASE_URL = "https://project-final-simon.onrender.com";
const endpointDocs = {
    "/": { description: "API Home", authRequired: false },
    "/classes": { description: "These are like school cources", authRequired: true },
    "/classes/:classId": { description: "Get details for a specific class", authRequired: false },
    "/classes/:classId/projects": { description: "Get projects in a class", authRequired: false },
    "/classes/projects/with-comments": { description: "Projects with comments included", authRequired: false },
    "/projects/:projectId": { description: "Get project details", authRequired: false },
    "/projects/:projectId/comments": { description: "Get comments for a project", authRequired: false },
    "/comments/all": { description: "List all comments", authRequired: true },
    "/comments/:commentId": { description: "Get a comment by ID", authRequired: false },
    "/projects/:projectId/comments/private": { description: "Private comments", authRequired: true },
    "/comments/:commentId/replies": { description: "Get replies for a comment", authRequired: false },
    "/user": { description: "Create a new user with image upload", authRequired: false },
    "/comments/:commentId/likes": { description: "Like a comment", authRequired: false },
    "/replies/:replyId/likes": { description: "Like a reply", authRequired: false },
    "/session": { description: "Create a new user session", authRequired: false },
    "/replies/:replyId": { description: "Update a reply", authRequired: false },
    "/comments/:commentId/toggle-check": { description: "Toggle comment checked status", authRequired: false },
};
const getHome = (app) => (req, res) => {
    const endpoints = (0, express_list_endpoints_1.default)(app);
    const tableRows = endpoints
        .map(ep => {
        const methods = ep.methods
            .map(m => `<span class="method method-${m.toLowerCase()}">${m}</span>`)
            .join(" ");
        const doc = endpointDocs[ep.path];
        const description = doc ? doc.description : "";
        const authRequired = doc && doc.authRequired ? "🔒" : "";
        const link = `<a href="${BASE_URL}${ep.path}" target="_blank" rel="noopener noreferrer">${ep.path}</a>`;
        return `
        <tr>
          <td class="path">${link}</td>
          <td class="methods">${methods}</td>
          <td class="description">${description}</td>
          <td class="auth-required">${authRequired}</td>
        </tr>
      `;
    })
        .join("");
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Classymc API</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <h1>Welcome to the Classymc API</h1>
      <p>Below are the available endpoints and their HTTP methods:</p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Path</th>
              <th>Methods</th>
              <th>Description</th>
              <th>Requires Authentication</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
};
exports.getHome = getHome;
