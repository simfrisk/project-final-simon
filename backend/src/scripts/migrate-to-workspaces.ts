import dotenv from "dotenv"
dotenv.config()

import mongoose from "mongoose"
import { UserModel } from "../models/user"
import { ClassModel } from "../models/Class"
import { WorkspaceModel } from "../models/workspace"
import { TeamModel } from "../models/Team"
import { Project } from "../models/Projects"
import { CommentModel } from "../models/Comment"
import { Reply } from "../models/Reply"

// Placeholder user ID (the "Deleted User" account)
const PLACEHOLDER_USER_ID = new mongoose.Types.ObjectId("68a45fbaca5d5d29fe782190")

/**
 * Migration script to convert existing data to workspace-based architecture
 * This creates "The Academy" workspace and migrates all existing data into it
 */
async function migrateToWorkspaces() {
  const mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost/final-project"

  try {
    await mongoose.connect(mongoUrl)
    console.log("✅ Connected to MongoDB")

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Step 1: Check if migration already ran
      const existingWorkspaces = await WorkspaceModel.countDocuments().session(session)
      if (existingWorkspaces > 0) {
        console.log("⚠️  Workspaces already exist. Migration may have already been run.")
        console.log("   If you want to re-run this migration, please delete all workspaces first.")
        await session.abortTransaction()
        session.endSession()
        await mongoose.disconnect()
        return
      }

      // Step 2: Find or create the placeholder user
      let placeholderUser = await UserModel.findById(PLACEHOLDER_USER_ID).session(session)
      if (!placeholderUser) {
        console.log("📝 Creating placeholder 'Deleted User' account...")
        const created = await UserModel.create(
          [
            {
              _id: PLACEHOLDER_USER_ID,
              name: "Deleted User",
              email: "deleted@placeholder.local",
              password: "$2b$10$placeholder.hash.not.for.login",
              role: "student",
              profileImage:
                "https://res.cloudinary.com/dgr7l5nsx/image/upload/w_100,h_100,c_fill/v1754899421/profile_pictures/wtvbkvjnxrbdzfvjcmbi.png",
              workspaces: [],
              teams: [],
              assignedTeams: [],
              schemaVersion: "v2",
            },
          ],
          { session }
        )
        placeholderUser = created[0]
        console.log("✅ Placeholder user created")
      }

      // Step 3: Find the oldest teacher to be the workspace creator
      const oldestTeacher = await UserModel.findOne({ role: "teacher" })
        .sort({ _id: 1 })
        .session(session)

      if (!oldestTeacher) {
        console.log("❌ No teachers found in the database. Cannot create workspace.")
        console.log("   Please create at least one teacher account first.")
        await session.abortTransaction()
        session.endSession()
        await mongoose.disconnect()
        return
      }

      // Step 4: Create "The Academy" workspace
      console.log("🏫 Creating 'The Academy' workspace...")
      const theAcademy = await WorkspaceModel.create(
        [
          {
            name: "The Academy",
            createdBy: oldestTeacher._id,
            createdAt: new Date(),
            teams: [],
            classes: [],
            schemaVersion: "v2",
          },
        ],
        { session }
      )
      const workspaceId = theAcademy[0]._id
      console.log(`✅ Workspace created with ID: ${workspaceId}`)

      // Step 5: Migrate all users to the workspace (except placeholder)
      console.log("👥 Migrating all users to workspace...")
      const allUsers = await UserModel.find({}).session(session)

      for (const user of allUsers) {
        user.workspaces = [workspaceId]
        user.teams = []
        user.assignedTeams = []
        user.schemaVersion = "v2"
        await user.save({ session })
      }
      console.log(`✅ Migrated ${allUsers.length} users to workspace`)

      // Step 6: Create "Spring 2025" team with all students
      console.log("👥 Creating 'Spring 2025' team with all students...")
      const allStudents = await UserModel.find({
        role: "student",
        _id: { $ne: PLACEHOLDER_USER_ID }, // Exclude placeholder user
      }).session(session)

      const allTeachers = await UserModel.find({ role: "teacher" }).session(session)

      const spring2025Team = await TeamModel.create(
        [
          {
            teamName: "Spring 2025",
            createdBy: oldestTeacher._id,
            createdAt: new Date(),
            assignedTeachers: allTeachers.map((t) => t._id),
            assignedStudents: allStudents.map((s) => s._id),
            workspaceId: workspaceId,
            accessTo: [], // Will be updated with classes later
            schemaVersion: "v2",
          },
        ],
        { session }
      )
      const teamId = spring2025Team[0]._id
      console.log(`✅ Team created with ${allStudents.length} students and ${allTeachers.length} teachers`)

      // Step 7: Update all students to be part of the team
      for (const student of allStudents) {
        student.teams = [teamId]
        await student.save({ session })
      }

      // Step 8: Update all teachers to be assigned to the team
      for (const teacher of allTeachers) {
        teacher.assignedTeams = [teamId]
        await teacher.save({ session })
      }

      // Step 9: Migrate all classes to the workspace
      console.log("📚 Migrating all classes to workspace...")
      const allClasses = await ClassModel.find({}).session(session)

      for (const cls of allClasses) {
        cls.workspaceId = workspaceId
        cls.schemaVersion = "v2"
        await cls.save({ session })
      }

      // Update workspace with class IDs
      theAcademy[0].classes = allClasses.map((cls) => cls._id)
      theAcademy[0].teams = [teamId]
      await theAcademy[0].save({ session })

      // Update team with access to all classes
      spring2025Team[0].accessTo = allClasses.map((cls) => cls._id)
      await spring2025Team[0].save({ session })
      console.log(`✅ Migrated ${allClasses.length} classes to workspace and granted team access`)

      // Step 10: Add schemaVersion to all projects
      console.log("📁 Updating projects schema...")
      const projectUpdateResult = await Project.updateMany(
        { schemaVersion: { $exists: false } },
        { $set: { schemaVersion: "v2" } }
      ).session(session)
      console.log(`✅ Updated ${projectUpdateResult.modifiedCount} projects`)

      // Step 11: Add schemaVersion to all comments
      console.log("💬 Updating comments schema...")
      const commentUpdateResult = await CommentModel.updateMany(
        { schemaVersion: { $exists: false } },
        { $set: { schemaVersion: "v2" } }
      ).session(session)
      console.log(`✅ Updated ${commentUpdateResult.modifiedCount} comments`)

      // Step 12: Add schemaVersion to all replies
      console.log("↩️  Updating replies schema...")
      const replyUpdateResult = await Reply.updateMany(
        { schemaVersion: { $exists: false } },
        { $set: { schemaVersion: "v2" } }
      ).session(session)
      console.log(`✅ Updated ${replyUpdateResult.modifiedCount} replies`)

      // Commit the transaction
      await session.commitTransaction()
      session.endSession()

      console.log("\n🎉 Migration completed successfully!")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log(`📊 Summary:`)
      console.log(`   - Workspace: "The Academy" (ID: ${workspaceId})`)
      console.log(`   - Team: "Spring 2025" (ID: ${teamId})`)
      console.log(`   - Users migrated: ${allUsers.length}`)
      console.log(`   - Students in team: ${allStudents.length}`)
      console.log(`   - Teachers in team: ${allTeachers.length}`)
      console.log(`   - Classes migrated: ${allClasses.length}`)
      console.log(`   - Projects updated: ${projectUpdateResult.modifiedCount}`)
      console.log(`   - Comments updated: ${commentUpdateResult.modifiedCount}`)
      console.log(`   - Replies updated: ${replyUpdateResult.modifiedCount}`)
      console.log(`   - Placeholder user: ${placeholderUser ? "exists" : "created"}`)
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      console.error("❌ Migration failed:", error)
      throw error
    }

    await mongoose.disconnect()
    console.log("✅ Disconnected from MongoDB")
  } catch (error) {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  }
}

// Run the migration
migrateToWorkspaces()
