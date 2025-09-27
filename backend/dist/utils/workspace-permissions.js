"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacePermissionChecker = void 0;
const user_1 = require("../models/user");
class WorkspacePermissionChecker {
    static async canInviteMembers(workspaceId, userId) {
        try {
            const user = await user_1.UserModel.findById(userId);
            if (!user)
                return false;
            // Only teachers can invite members
            return user.role === "teacher";
        }
        catch (error) {
            return false;
        }
    }
}
exports.WorkspacePermissionChecker = WorkspacePermissionChecker;
