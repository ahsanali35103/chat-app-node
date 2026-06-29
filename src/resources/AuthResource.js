const BaseResource = require('./BaseResource');

class AuthResource extends BaseResource {
    toArray() {
        return {
            id: this.resource._id,
            name: this.resource.name,
            email: this.resource.email
        };
    }

    static withToken(user, token) {
        return {
            ...new this(user).toArray(),
            token
        };
    }
}

module.exports = AuthResource;
