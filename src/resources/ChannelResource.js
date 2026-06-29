const BaseResource = require('./BaseResource');

class ChannelResource extends BaseResource {
    toArray() {
        return {
            id: this.resource._id,
            name: this.resource.name,
            workspace_id: this.resource.workspace_id,
            team_id: this.resource.team_id,
            type: this.resource.type,
            direct_id: this.resource.direct_id,
            created_id: this.resource.created_id,
            members: this.resource.members,
            created_at: this.resource.createdAt,
            updated_at: this.resource.updatedAt
        };
    }
}

module.exports = ChannelResource;
