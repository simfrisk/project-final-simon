import { UserModel } from "../models/user"

export class WorkspacePermissionChecker {
  static async canInviteMembers(workspaceId: string, userId: string): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId)
      if (!user) return false

      // Only teachers can invite members
      return user.role === "teacher"
    } catch (error) {
      return false
    }
  }
}
