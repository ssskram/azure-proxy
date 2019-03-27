const app = {
  list: "value",
  item: {
    name: "name",
    status: "properties.state",
    url: "properties.defaultHostName",
    resourceGroup: "properties.resourceGroup"
  }
};

const func = {
  list: "value",
  item: {
    name: "properties.name"
  }
};

module.exports = {
  app,
  func
};
