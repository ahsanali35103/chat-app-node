const BaseResource = require('./BaseResource');

class TeamResource extends BaseResource {
    toArray() {
        return {
            id: this.resource._id,
            workspace_id: this.resource.workspace_id,
            name: this.resource.name,
            description: this.resource.description,
            creator_id: this.resource.creator_id,
            members_count: this.resource.members ? this.resource.members.length : 0,
            members_list: this.resource.members || [],
            created_at: this.resource.createdAt
        };
    }
}

module.exports = TeamResource;
