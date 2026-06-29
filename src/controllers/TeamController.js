const Team = require('../models/TeamModel');
const User = require('../models/UserModel'); 
const TeamResource = require('../resources/TeamResource');
const { asyncHandler } = require('../middlewares/Validate');
const { createError } = require("../utils/GlobalResponseHandler");

const uniqueIds = (arr) => Array.from(new Set((arr || []).map(id => id.toString())));
/**
 * @desc Create a new team
 */
const create = asyncHandler(async (req, res) => {
    const { workspace_id, name, description } = req.validatedData;

    const team = await Team.create({
        workspace_id,
        name,
        description,
        creator_id: req.user._id,
        members: [req.user._id]
    });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { teams: team._id } });

    req.event = {
        eventName: 'team_created',
        module: 'team',
        operation: 'create',
        referenceId: team._id,
        userIds: team.members,
        metadata: { team: TeamResource.make(team) }
    };
    res.success('Team created successfully.', { 
        team: TeamResource.make(team) 
    }, 201);
});

/**
 * @desc Get team details
 */
const read = asyncHandler(async (req, res) => {
    res.success('Team retrieved successfully.', { 
        team: TeamResource.make(req.team) 
    });
});

/**
 * @desc Update team details
 */
const update = asyncHandler(async (req, res) => {
    const updatePayload = req.updatePayload;

    Object.assign(req.team, updatePayload);
    await req.team.save();
req.event = {
        eventName: 'team_updated',
        module: 'team',
        operation: 'update',
        referenceId: req.team._id,
        userIds: req.team.members,
        metadata: { team: TeamResource.make(req.team) }
    };
    res.success('Team updated successfully.', { 
        team: TeamResource.make(req.team) 
    });
});

/**
 * @desc Delete a team and sync user records
 */
const deleteTeam = asyncHandler(async (req, res) => {
    await User.updateMany(
        { teams: req.team._id },
        { $pull: { teams: req.team._id } }
    );

    await req.team.deleteOne();
req.event = {
        eventName: 'team_deleted',
        module: 'team',
        operation: 'delete',
        referenceId: req.team._id,
        userIds: req.team.members,
        metadata: { teamId: req.team._id.toString() }
    };
    res.success('Team deleted successfully.');
});

/**
 * @desc Add members to team and sync user records
 */
const addMember = asyncHandler(async (req, res) => {
    const { members } = req.validatedData;

    const team = await Team.findByIdAndUpdate(
        req.team._id,
        { $addToSet: { members: { $each: members } } },
        { new: true }
    );

    await User.updateMany(
        { _id: { $in: members } },
        { $addToSet: { teams: req.team._id } }
    );

    req.event = {
        eventName: 'team_member_added',
        module: 'team',
        operation: 'member_added',
        referenceId: team._id,
        userIds: team.members,
        metadata: {
            team: TeamResource.make(team),
            teamId: team._id.toString(),
            workspaceId: team.workspace_id ? team.workspace_id.toString() : undefined,
            addedUserIds: (members || []).map(id => id.toString())
        }
    };
    res.success('Members added successfully.', { 
        team: TeamResource.make(team) 
    });
});

/**
 * @desc Remove members from team and sync user records
 */
const removeMember = asyncHandler(async (req, res) => {
    const { members } = req.validatedData;

    const team = await Team.findByIdAndUpdate(
        req.team._id,
        { $pullAll: { members } },
        { new: true }
    );

    await User.updateMany(
        { _id: { $in: members } },
        { $pull: { teams: req.team._id } }
    );
 req.event = {
        eventName: 'team_member_removed',
        module: 'team',
        operation: 'member_removed',
        referenceId: team._id,
        userIds: uniqueIds([...(team.members || []), ...(members || [])]),
        metadata: {
            team: TeamResource.make(team),
            teamId: team._id.toString(),
            workspaceId: team.workspace_id ? team.workspace_id.toString() : undefined,
            removedUserIds: (members || []).map(id => id.toString())
        }
    };

    res.success('Members removed successfully.', { 
        team: TeamResource.make(team) 
    });
});

module.exports = {
    create,
    read,
    update,
    deleteTeam,
    addMember,
    removeMember
};
