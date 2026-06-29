const Channel = require("../../models/ChannelModel");
const { asyncHandler } = require("../Validate");
const { createError } = require("../../utils/GlobalResponseHandler");

const verifyChannelMember = asyncHandler(async (req, res, next) => {
  const { channelId } = req.validatedData;
  const userId = req.user._id;

  const channel = await Channel.findOne({
    _id: channelId,
    "members.user_id": userId,
  });

  if (!channel) {
    return next(createError("You are not a member of this channel.", 403));
  }

  req.channel = channel;
  next();
});

module.exports = verifyChannelMember;
