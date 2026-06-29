const BaseResource = require('./BaseResource');

class MessageResource extends BaseResource {
  toArray() {
    const message = this.resource;

    const response = {
      id: message._id,
      channel_id: message.channelId,
      sender: message.senderId,
      type: message.type,
      is_edited: message.isEdited,
      created_at: message.createdAt,
      updated_at: message.updatedAt,
    };

    if (message.type === "text") {
      response.content = message.content;
    }

    if (message.type === "file") {
      response.file = {
        file_id: message.file.fileId,
        filename: message.file.filename,
        mimetype: message.file.mimetype,
        size: message.file.size,
      };
    }

    return response;
  }
}

module.exports = MessageResource;
