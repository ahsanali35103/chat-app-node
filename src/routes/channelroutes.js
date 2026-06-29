const express = require('express');
const router = express.Router();

const channelController = require('../controllers/ChannelController');
const { validate, validateQuery } = require('../middlewares/Validate');
const auth = require('../middlewares/auth/CheckTokenMiddleware');

const channelExist = require('../middlewares/channel/CheckChannelExistMiddleware');
const channelCreate = require('../middlewares/channel/CheckChannelCreateMiddleware');
const memberCheck = require('../middlewares/channel/MemberCheckMiddleware');
const channelAdmin = require('../middlewares/channel/CheckChannelAdminMiddleware');
const channelAddMember = require('../middlewares/channel/CheckChannelAddMemberMiddleware');
const channelRemoveMember = require('../middlewares/channel/CheckChannelRemoveMemberMiddleware');

const createChannelSchema = require('../requests/channel/CreateChannelRequest');
const readChannelSchema = require('../requests/channel/ReadChannelRequest');
const updateChannelSchema = require('../requests/channel/UpdateChannelRequest');
const deleteChannelSchema = require('../requests/channel/DeleteChannelRequest');
const addMemberSchema = require('../requests/channel/AddMemberRequest');
const removeMemberSchema = require('../requests/channel/RemoveMemberRequest');

// All channel routes require authentication
router.use(auth);

router.post('/create', 
    validate(createChannelSchema), 
    memberCheck, 
    channelCreate, 
    channelController.create
);

router.get('/read', 
    validate(readChannelSchema), 
    channelExist, 
    channelController.read
);

router.patch('/update', 
    validate(updateChannelSchema), 
    channelExist, 
    channelAdmin, 
    channelController.update
);

router.delete('/delete', 
    validate(deleteChannelSchema), 
    channelExist, 
    channelAdmin, 
    channelController.deleteChannel
);

router.post('/add-member', 
    validate(addMemberSchema), 
    channelExist, 
    channelAdmin, 
    channelAddMember, 
    channelController.addMember
);

router.delete('/remove-member', 
    validate(removeMemberSchema), 
    channelExist, 
    channelAdmin, 
    channelRemoveMember, 
    channelController.removeMember
);

module.exports = router;

