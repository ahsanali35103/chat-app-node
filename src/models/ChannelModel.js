const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.type !== "direct";
      }, // Name optional for direct channels
    },
    workspace_id: {
      type: String, // String to avoid ref DB checks for now
      required: true,
    },
    team_id: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["public", "private", "direct"],
      required: true,
    },
    created_id: {
      type: String,
      required: true,
    },
    direct_id: {
      type: String,
      default: null,
    },
    members: [
      {
        user_id: { type: String, required: true },
        role: { type: String, default: "member" },
      },
    ],
    join_requests: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);
module.exports =
  mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);
