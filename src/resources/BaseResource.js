class BaseResource {
  constructor(resource) {
    this.resource = resource;
  }

  toArray() {
    return this.resource;
  }

  static make(resource) {
    if (!resource) return null;
    return new this(resource).toArray();
  }

  static collection(resources) {
    return resources.map((resource) => new this(resource).toArray());
  }
}

module.exports = BaseResource;
