const takeSize = hardwareProfile => hardwareProfile.vmSize;
const takeImage = storageProfile => {
  return {
    type: storageProfile.imageReference.offer,
    sku: storageProfile.imageReference.sku
  };
};
const takeOS = storageProfile => {
  return {
    osType: storageProfile.osDisk.osType,
    diskSize: storageProfile.osDisk.diskSizeGB
  };
};

const virtualMachine = {
  list: "value",
  item: {
    name: "name",
    size: "properties.hardwareProfile",
    image: "properties.storageProfile",
    osDisk: "properties.storageProfile"
  },
  operate: [
    {
      run: takeSize,
      on: "size"
    },
    {
      run: takeImage,
      on: "image"
    },
    {
      run: takeOS,
      on: "osDisk"
    }
  ]
};

module.exports = {
  virtualMachine
};
