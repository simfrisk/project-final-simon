# 🚀 **Frontend Implementation Checklist**

## 📋 **1. Update Existing Routes in Fetches**

### **✅ Class Routes (Update existing fetches):**

```javascript
// OLD: GET /classes
// NEW: GET /workspace/:workspaceId/classes
const getClasses = async (workspaceId) => {
  return fetch(`/workspace/${workspaceId}/classes`)
}

// OLD: POST /classes
// NEW: POST /workspace/:workspaceId/classes
const createClass = async (workspaceId, classData) => {
  return fetch(`/workspace/${workspaceId}/classes`, {
    method: "POST",
    body: JSON.stringify(classData),
  })
}
```

### **✅ Team Routes (Update existing fetches):**

```javascript
// OLD: GET /teams
// NEW: GET /workspace/:workspaceId/teams
const getTeams = async (workspaceId) => {
  return fetch(`/workspace/${workspaceId}/teams`)
}

// OLD: POST /teams
// NEW: POST /workspace/:workspaceId/teams
const createTeam = async (workspaceId, teamData) => {
  return fetch(`/workspace/${workspaceId}/teams`, {
    method: "POST",
    body: JSON.stringify(teamData),
  })
}
```

---

## 📋 **2. New Stores to Create**

### **✅ Workspace Store (`workspaceStore.ts`):**

```typescript
interface Workspace {
  _id: string
  name: string
  createdBy: User
  teams: Team[]
  createdAt: string
}

interface WorkspaceStore {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  getWorkspaces: () => Promise<void>
  createWorkspace: (name: string) => Promise<void>
  setCurrentWorkspace: (workspace: Workspace) => void
}
```

### **✅ Team Store (`teamStore.ts`):**

```typescript
interface Team {
  _id: string
  teamName: string
  createdBy: User
  assignedTeachers: User[]
  accessTo: Class[]
  workspaceId: string
  createdAt: string
}

interface TeamStore {
  teams: Team[]
  currentTeam: Team | null
  getTeams: (workspaceId: string) => Promise<void>
  createTeam: (workspaceId: string, teamData: any) => Promise<void>
  addMember: (teamId: string, userId: string) => Promise<void>
  removeMember: (teamId: string, userId: string) => Promise<void>
  addTeacher: (teamId: string, userId: string) => Promise<void>
  removeTeacher: (teamId: string, userId: string) => Promise<void>
  giveClassAccess: (teamId: string, classId: string) => Promise<void>
  removeClassAccess: (teamId: string, classId: string) => Promise<void>
}
```

### **✅ Invitation Store (`invitationStore.ts`):**

```typescript
interface WorkspaceInvitation {
  _id: string
  workspaceId: string
  token: string
  expiresAt: string
  isUsed: boolean
  allowedRole: string
}

interface InvitationStore {
  invitations: WorkspaceInvitation[]
  createInvitation: (workspaceId: string, role: string) => Promise<string>
  validateInvitation: (token: string) => Promise<boolean>
  useInvitation: (token: string) => Promise<void>
  getInvitationHistory: (workspaceId: string) => Promise<void>
}
```

---

## 📋 **3. New API Fetches to Implement**

### **✅ Workspace API Functions:**

```typescript
// workspaceApi.ts
export const workspaceApi = {
  // Get all workspaces for current user
  getWorkspaces: () => fetch("/workspaces"),

  // Get specific workspace
  getWorkspace: (workspaceId: string) => fetch(`/workspace/${workspaceId}`),

  // Create new workspace
  createWorkspace: (name: string) =>
    fetch("/workspace", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  // Update workspace
  updateWorkspace: (workspaceId: string, data: any) =>
    fetch(`/workspace/${workspaceId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete workspace
  deleteWorkspace: (workspaceId: string) =>
    fetch(`/workspace/${workspaceId}`, {
      method: "DELETE",
    }),

  // Get users in workspace
  getWorkspaceUsers: (workspaceId: string) => fetch(`/workspace/${workspaceId}/users`),
}
```

### **✅ Team API Functions:**

```typescript
// teamApi.ts
export const teamApi = {
  // Get teams in workspace
  getTeams: (workspaceId: string) => fetch(`/workspace/${workspaceId}/teams`),

  // Get specific team
  getTeam: (teamId: string) => fetch(`/teams/${teamId}`),

  // Create team (bulk)
  createTeam: (
    workspaceId: string,
    teamData: {
      teamName: string
      members?: string[]
      teachers?: string[]
      classes?: string[]
    }
  ) =>
    fetch(`/workspace/${workspaceId}/teams`, {
      method: "POST",
      body: JSON.stringify(teamData),
    }),

  // Update team
  updateTeam: (teamId: string, data: any) =>
    fetch(`/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete team
  deleteTeam: (teamId: string) =>
    fetch(`/teams/${teamId}`, {
      method: "DELETE",
    }),

  // Individual member management
  addMember: (teamId: string, userId: string) =>
    fetch(`/teams/${teamId}/members/${userId}`, {
      method: "POST",
    }),

  removeMember: (teamId: string, userId: string) =>
    fetch(`/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    }),

  // Individual teacher management
  addTeacher: (teamId: string, userId: string) =>
    fetch(`/teams/${teamId}/teachers/${userId}`, {
      method: "POST",
    }),

  removeTeacher: (teamId: string, userId: string) =>
    fetch(`/teams/${teamId}/teachers/${userId}`, {
      method: "DELETE",
    }),

  // Individual class access management
  giveClassAccess: (teamId: string, classId: string) =>
    fetch(`/teams/${teamId}/classes/${classId}`, {
      method: "POST",
    }),

  removeClassAccess: (teamId: string, classId: string) =>
    fetch(`/teams/${teamId}/classes/${classId}`, {
      method: "DELETE",
    }),
}
```

### **✅ Invitation API Functions:**

```typescript
// invitationApi.ts
export const invitationApi = {
  // Create invitation link
  createInvitation: (workspaceId: string, role: "student" | "teacher") =>
    fetch(`/workspace/${workspaceId}/invite`, {
      method: "POST",
      body: JSON.stringify({ allowedRole: role }),
    }),

  // Validate invitation token
  validateInvitation: (token: string) => fetch(`/invitation/validate/${token}`),

  // Use invitation token (join workspace)
  useInvitation: (token: string) =>
    fetch("/invitation/use", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  // Get invitation history
  getInvitationHistory: (workspaceId: string) => fetch(`/workspace/${workspaceId}/invitations`),
}
```

---

## 📋 **4. Update Existing Stores**

### **✅ Class Store Updates:**

```typescript
// classStore.ts - Update existing functions
const classStore = {
  // Update to use workspaceId parameter
  getClasses: async (workspaceId: string) => {
    const response = await fetch(`/workspace/${workspaceId}/classes`)
    // ... rest of logic
  },

  // Update to use workspaceId parameter
  createClass: async (workspaceId: string, classData: any) => {
    const response = await fetch(`/workspace/${workspaceId}/classes`, {
      method: "POST",
      body: JSON.stringify(classData),
    })
    // ... rest of logic
  },
}
```

### **✅ User Store Updates:**

```typescript
// userStore.ts - Add new fields
interface User {
  // ... existing fields
  workspaces: string[] // NEW
  teams: string[] // NEW
  assignedTeams: string[] // NEW
}

const userStore = {
  // ... existing functions
  // Add functions to handle workspace/team membership
  joinWorkspace: async (workspaceId: string) => {
    /* ... */
  },
  leaveWorkspace: async (workspaceId: string) => {
    /* ... */
  },
}
```

---

## 📋 **5. New UI Components to Create**

### **✅ Workspace Management:**

- `WorkspaceSelector.tsx` - Dropdown to switch workspaces
- `CreateWorkspaceModal.tsx` - Modal to create new workspace
- `WorkspaceSettings.tsx` - Settings page for workspace

### **✅ Team Management:**

- `TeamList.tsx` - List of teams in workspace
- `CreateTeamModal.tsx` - Modal for bulk team creation
- `TeamCard.tsx` - Individual team display
- `TeamMembers.tsx` - Manage team members
- `TeamTeachers.tsx` - Manage assigned teachers
- `TeamClasses.tsx` - Manage class access

### **✅ Invitation System:**

- `InvitationLinkGenerator.tsx` - Generate signup links
- `InvitationHistory.tsx` - View past invitations
- `SignupPage.tsx` - New user signup with invitation token

---

## 📋 **6. Update Navigation/Routing**

### **✅ Add New Routes:**

```typescript
// App.tsx or router config
const routes = [
  // ... existing routes
  { path: "/workspace/:id", component: WorkspaceDashboard },
  { path: "/workspace/:id/teams", component: TeamManagement },
  { path: "/workspace/:id/settings", component: WorkspaceSettings },
  { path: "/signup/:token", component: SignupPage },
]
```

### **✅ Update Navigation:**

- Add workspace selector to header
- Add team management to sidebar
- Add invitation management to admin panel

---

## 🎯 **Priority Order:**

1. **High Priority:** Update existing class/team fetches
2. **High Priority:** Create workspace store and API
3. **Medium Priority:** Create team store and API
4. **Medium Priority:** Update user store with new fields
5. **Low Priority:** Create invitation system
6. **Low Priority:** Build UI components

---

## 📝 **Notes:**

- All API calls should include proper error handling
- Remember to update authentication headers for all requests
- Consider implementing loading states for all async operations
- Test workspace switching functionality thoroughly
- Ensure proper cleanup when leaving workspaces

This gives you a complete roadmap for implementing the new workspace-centric architecture! 🚀
