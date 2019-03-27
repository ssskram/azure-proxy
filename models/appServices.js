const appService = {
  list: "value",
  item: {
    name: "properties.name",
    resourceGroup: "properties.resourceGroup",
    countInstances: "properties.currentNumberOfWorkers",
    status: "properties.status",
    size: "sku.size",
    countServices: "properties.numberOfSites",
    services: "properties.tags"
  }
};

module.exports = {
  appService
};
