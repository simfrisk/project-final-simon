# Database Migration to Workspace Architecture (v2)

## Overview

This migration script transitions your database from the v1 schema to the new workspace-based architecture (v2). The migration is **safe** and **atomic** - it will either complete fully or roll back all changes if any error occurs.

## What the Migration Does

### 1. Creates "The Academy" Workspace
- Creates a default workspace called "The Academy"
- The oldest teacher in the database becomes the workspace creator
- All existing data is moved into this workspace

### 2. Creates "Spring 2025" Team
- Creates a team called "Spring 2025" within The Academy workspace
- **All students** (except the placeholder user) are added to this team
- **All teachers** are assigned to teach this team
- The team is granted access to **all existing classes**

### 3. Migrates Existing Data
- **Users**: Adds workspace, teams, and assignedTeams arrays
- **Classes**: Links each class to The Academy workspace
- **Projects**: Adds schemaVersion field
- **Comments**: Adds schemaVersion field
- **Replies**: Adds schemaVersion field

### 4. Handles the "Deleted User" Account
- Creates or updates the placeholder user (ID: `68a45fbaca5d5d29fe782190`)
- This user can be referenced across all workspaces
- Used when users are deleted but their comments/replies need to remain

## Schema Changes

### User Model
```typescript
// New fields:
workspaces: ObjectId[]      // Workspaces the user belongs to
teams: ObjectId[]           // Teams the user is a student in
assignedTeams: ObjectId[]   // Teams the user teaches (for teachers)
schemaVersion: "v2"
```

### Class Model
```typescript
// New fields:
workspaceId: ObjectId       // Required: workspace this class belongs to
schemaVersion: "v2"
```

### New Models
- **Workspace**: Organizational container for teams and classes
- **Team**: Groups of students and teachers with access to specific classes
- **WorkspaceInvitation**: Invitation system for joining workspaces/teams

## How to Run the Migration

### Prerequisites
1. Ensure your `.env` file has the correct `MONGO_URL`
2. **Backup your database** before running the migration
3. Make sure at least one teacher exists in the database

### Step 1: Backup Your Database
```bash
# Example MongoDB backup command
mongodump --uri="your-mongodb-uri" --out=./backup-$(date +%Y%m%d)
```

### Step 2: Run the Migration
```bash
cd backend
npm run migrate
```

### Expected Output
```
✅ Connected to MongoDB
📝 Creating placeholder 'Deleted User' account...
✅ Placeholder user created
🏫 Creating 'The Academy' workspace...
✅ Workspace created with ID: 507f1f77bcf86cd799439011
👥 Migrating all users to workspace...
✅ Migrated 25 users to workspace
👥 Creating 'Spring 2025' team with all students...
✅ Team created with 20 students and 5 teachers
📚 Migrating all classes to workspace...
✅ Migrated 8 classes to workspace and granted team access
📁 Updating projects schema...
✅ Updated 150 projects
💬 Updating comments schema...
✅ Updated 450 comments
↩️  Updating replies schema...
✅ Updated 320 replies

🎉 Migration completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary:
   - Workspace: "The Academy" (ID: 507f1f77bcf86cd799439011)
   - Team: "Spring 2025" (ID: 507f1f77bcf86cd799439012)
   - Users migrated: 25
   - Students in team: 20
   - Teachers in team: 5
   - Classes migrated: 8
   - Projects updated: 150
   - Comments updated: 450
   - Replies updated: 320
   - Placeholder user: exists
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Disconnected from MongoDB
```

## Safety Features

### Transaction-Based
The migration uses MongoDB transactions, so if any step fails, **all changes are automatically rolled back**.

### Idempotency Check
The script checks if workspaces already exist. If they do, it will exit safely without making changes.

### Validation
- Checks for required data (e.g., at least one teacher)
- Validates placeholder user creation
- Ensures all relationships are properly established

## What Happens to Existing Users?

### All Users
- Remain unchanged except for new fields
- Added to "The Academy" workspace
- All existing data (comments, projects, likes) remains intact

### Students
- Added to the "Spring 2025" team
- Gain access to all existing classes through team membership

### Teachers
- Assigned to teach the "Spring 2025" team
- Can manage team members and class access

### Placeholder User
- Automatically created if it doesn't exist
- Receives workspace membership for consistency
- Continues to work for deleted user references

## After Migration

### For Development
1. Update `.env` to set `RESET_DB=false` (if currently using reset database)
2. Restart your backend server
3. Test the new workspace features

### For Production
1. Verify the migration completed successfully
2. Deploy the new backend code
3. Deploy the updated frontend
4. Monitor for any issues

## Rollback (If Needed)

If you need to rollback:

```bash
# Restore from your backup
mongorestore --uri="your-mongodb-uri" ./backup-YYYYMMDD
```

## Troubleshooting

### "No teachers found in the database"
Create at least one teacher account before running the migration:
```bash
# Use your API or create directly in the database
```

### "Workspaces already exist"
The migration has likely already been run. Check your database:
```bash
# In MongoDB shell
db.workspaces.find()
```

### Transaction Failed
Check the error message. Common issues:
- Database connection lost
- Insufficient permissions
- Schema validation errors

## Questions or Issues?

If you encounter any problems during migration, check:
1. MongoDB connection is stable
2. You have a recent database backup
3. All new models are properly imported in the migration script

## Migration Script Location

[backend/src/scripts/migrate-to-workspaces.ts](backend/src/scripts/migrate-to-workspaces.ts)
