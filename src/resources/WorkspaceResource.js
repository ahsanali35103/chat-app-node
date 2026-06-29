const BaseResource = require('./BaseResource');

class WorkspaceResource extends BaseResource {
    toArray() {
        return {
            workspace_id: this.resource._id,
            name: this.resource.name,
            description: this.resource.description,
            owner: this.resource.ownerId,
            members_count: this.resource.members ? this.resource.members.length : 0,
            created_at: this.resource.createdAt
        };
    }
}

module.exports = WorkspaceResource;