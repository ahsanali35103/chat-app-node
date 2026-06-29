const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },
    content: {
      type: String,
      default: null,
    },
    file: {
      fileId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      filename: {
        type: String,
        default: null,
      },
      mimetype: {
        type: String,
        default: null,
      },
      size: {
        type: Number,
        default: null,
      },
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Message", MessageSchema);
