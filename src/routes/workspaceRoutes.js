const express = require('express');
const router = express.Router();

const workspaceController = require('../controllers/WorkspaceController');
const { validate } = require('../middlewares/Validate');
const auth = require('../middlewares/auth/CheckTokenMiddleware');

// Workspace Middlewares (lowercase)
const checkWorkspaceExists = require('../middlewares/workspace/CheckWorkspaceExistsMiddleware');
const checkWorkspaceExist = require('../middlewares/workspace/CheckWorkspaceExistMiddleware');
const checkUniqueWorkspace = require('../middlewares/workspace/CheckUniqueWorkspaceMiddleware');
const checkWorkspaceCreator = require('../middlewares/workspace/CheckWorkspaceCreateMiddleware');
const checkMembersExist = require('../middlewares/workspace/CheckMembersExistMiddleware');
const checkReadWorkspace = require('../middlewares/workspace/CheckReadWorkspaceMiddleware');
const checkInvitationMembers = require('../middlewares/invitation/CheckInvitationMembersMiddleware');
const sendInvitationEmail = require('../middlewares/invitation/SendInvitationEmailMiddleware');

// Request Schemas (lowercase)
const createWorkspaceSchema = require('../requests/workspace/CreateWorkspaceRequest');
const updateWorkspaceSchema = require('../requests/workspace/UpdateWorkspaceRequest');
const addWorkspaceMemberSchema = require('../requests/workspace/AddWorkspaceMemberRequest');
const removeWorkspaceMemberSchema = require('../requests/workspace/RemoveWorkspaceMemberRequest');
const readWorkspaceSchema = require('../requests/workspace/ReadWorkspaceRequest');
const deleteWorkspaceSchema = require('../requests/workspace/DeleteWorkspaceRequest');
const inviteWorkspaceMemberSchema = require('../requests/workspace/InviteWorkspaceMemberRequest');

// Routes

// 1. Get workspaces (All OR Single based on workspace_id in body)
router.get('/read', auth, validate(readWorkspaceSchema), checkReadWorkspace, workspaceController.read);

// 2. Create a new workspace
router.post('/create', auth, validate(createWorkspaceSchema), checkUniqueWorkspace, workspaceController.create);

// 4. Update a workspace (owner only) -- passed in body
router.put('/update', auth, validate(updateWorkspaceSchema), checkWorkspaceExists, checkWorkspaceCreator, workspaceController.update);

// 5. Delete a workspace (owner only) -- passed in body
router.delete('/delete', auth, validate(deleteWorkspaceSchema), checkWorkspaceExists, checkWorkspaceCreator, workspaceController.delete);

// 6. Add members to a workspace (creator only) -- passed in body
router.post('/add-member', auth, validate(addWorkspaceMemberSchema), checkWorkspaceExists, checkWorkspaceCreator, checkMembersExist, workspaceController.addMember);

// 7. Remove members from a workspace (owner only) -- passed in body
router.delete('/remove-member', auth, validate(removeWorkspaceMemberSchema), checkWorkspaceExists, checkWorkspaceCreator, workspaceController.removeMember);

// 8. Invite members to a workspace (creator only) -- passed in body
router.post('/invite-member', auth, validate(inviteWorkspaceMemberSchema), checkWorkspaceExists, checkWorkspaceCreator, checkInvitationMembers, sendInvitationEmail, workspaceController.inviteMember);

module.exports = router;
