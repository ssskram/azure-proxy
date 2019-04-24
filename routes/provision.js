const express = require("express");
const router = express.Router();
const refreshToken = require("../refresh");
const fetch = require("node-fetch");
const uuid = require("uuid/v1");

// spin up new service in api resource group
router.post("/api", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/api-applications/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "?api-version=2016-08-01",
    {
      method: "PUT",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken()),
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        kind: "api",
        location: "USGov Virginia",
        properties: {
          httpsOnly: true,
          serverFarmId:
            "/subscriptions/" +
            process.env.SUBSCRIPTION +
            "/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/api-apps-1",
          siteConfig: {
            use32BitWorkerProcess: false,
            httpLoggingEnabled: true,
            appSettings: [
              { name: "WEBSITE_HTTPLOGGING_RETENTION_DAYS", value: "30" },
              { name: "ASPNETCORE_ENVIRONMENT", value: "Production" },
              { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "8.11.1" },
              { name: "BEARER", value: await uuid() }
            ]
          }
        }
      })
    }
  )
    .then(res => res.json())
    .then(data =>
      res.status(200).send({
        name: data.name,
        status: data.properties.state,
        url: data.properties.defaultHostName,
        resourceGroup: data.properties.resourceGroup
      })
    )
    .then(() => tellBaloo({ type: "API", name: req.query.appName }))
    .catch(err => res.status(500).send(err));
});

// spin up new service in client resource group
router.post("/client", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/client-applications/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "?api-version=2016-08-01",
    {
      method: "PUT",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken()),
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        kind: "app",
        location: "USGov Virginia",
        properties: {
          httpsOnly: true,
          serverFarmId:
            "/subscriptions/" +
            process.env.SUBSCRIPTION +
            "/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/client-apps-1",
          siteConfig: {
            use32BitWorkerProcess: false,
            httpLoggingEnabled: true,
            appSettings: [
              { name: "WEBSITE_HTTPLOGGING_RETENTION_DAYS", value: "30" },
              { name: "ASPNETCORE_ENVIRONMENT", value: "Production" },
              { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "8.11.1" },
              {
                name: "REACT_APP_365_API",
                value: process.env.REACT_APP_365_API
              },
              {
                name: "REACT_APP_CART_API",
                value: process.env.REACT_APP_CART_API
              },
              {
                name: "REACT_APP_GOOGLE_API",
                value: process.env.REACT_APP_GOOGLE_API
              },
              {
                name: "REACT_APP_SENDGRID_API",
                value: process.env.REACT_APP_SENDGRID_API
              },
              { name: "REACT_APP_MONGO", value: process.env.REACT_APP_MONGO },
              {
                name: "REACT_APP_AZURE_PROXY",
                value: process.env.REACT_APP_AZURE_PROXY
              },
              {
                name: "REACT_APP_BLOBLY_API",
                value: process.env.REACT_APP_BLOBLY_API
              }
            ]
          }
        }
      })
    }
  )
    .then(res => res.json())
    .then(data =>
      res.status(200).send({
        name: data.name,
        status: data.properties.state,
        url: data.properties.defaultHostName,
        resourceGroup: data.properties.resourceGroup
      })
    )
    .then(() => tellBaloo({ type: "client", name: req.query.appName }))
    .catch(err => res.status(500).send(err));
});

// spin up new service in serverless resource group
router.post("/lambda", async (req, res) => {
  let appSettings = [
    { name: "AzureWebJobsStorage", value: process.env.AzureWebJobsStorage },
    { name: "FUNCTION_APP_EDIT_MODE", value: "readwrite" },
    { name: "FUNCTIONS_EXTENSION_VERSION", value: "~2" },
    { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "8.11.1" },
    { name: "WEBSITE_TIME_ZONE", value: "Eastern Standard Time" }
  ];
  if (req.query.runtime == "node") {
    appSettings.push({ name: "FUNCTIONS_WORKER_RUNTIME", value: "node" });
  } else {
    appSettings.push({ name: "FUNCTIONS_WORKER_RUNTIME", value: "dotnet" });
  }
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/lambdas/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "?api-version=2016-08-01",
    {
      method: "PUT",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken()),
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        kind: "functionapp",
        location: "USGov Virginia",
        properties: {
          httpsOnly: true,
          serverFarmId:
            "/subscriptions/" +
            process.env.SUBSCRIPTION +
            "/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/serverless-apps-1",
          siteConfig: {
            alwaysOn: true,
            use32BitWorkerProcess: false,
            appSettings: appSettings,
            cors: {
              allowedOrigins: ["*"]
            }
          }
        }
      })
    }
  )
    .then(res => res.json())
    .then(data =>
      res.status(200).send({
        name: data.name,
        status: data.properties.state,
        url: data.properties.defaultHostName,
        resourceGroup: data.properties.resourceGroup
      })
    )
    .then(() => tellBaloo({ type: "lambda", name: req.query.appName }))
    .catch(err => res.status(500).send(err));
});

// spin up new virtual machine
router.post("/virtualMachine", async (req, res) => {
  let vmSize;
  if (req.query.size == "scrawny") {
    vmSize = "Standard_B1ms";
  } else if (req.query.size == "well-fed") {
    vmSize = "Standard_B2s";
  } else if (req.query.size == "beefcake") {
    vmSize = "Standard_B4ms";
  } else {
    res
      .status(500)
      .send({
        error:
          "Query parameter size must be one of the following values: scrawny, well-fed, or beefcake.  Stop wasting my time, maggot."
      });
  }

  const createIPAddress = async () => {
    const call = await fetch(
      "https://management.usgovcloudapi.net/subscriptions/" +
        process.env.SUBSCRIPTION +
        "/resourceGroups/virtual-machines/providers/Microsoft.Network/publicIPAddresses/" +
        req.query.serverName +
        "?api-version=2018-11-01",
      {
        method: "PUT",
        headers: new Headers({
          Authorization: "Bearer " + (await refreshToken()),
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          location: "USGov Virginia",
          properties: {
            publicIPAllocationMethod: "Static",
            idleTimeoutInMinutes: 10,
            publicIPAddressVersion: "IPv4"
          },
          sku: {
            name: "Standard"
          }
        })
      }
    ).catch(err => res.status(500).send(err));
    const response = await call.json();
    return await response.name;
  };

  const createNetworkInterface = async ipAddress => {
    const call = await fetch(
      "https://management.usgovcloudapi.net/subscriptions/" +
        process.env.SUBSCRIPTION +
        "/resourceGroups/virtual-machines/providers/Microsoft.Network/networkInterfaces/" +
        ipAddress +
        "?api-version=2018-11-01",
      {
        method: "PUT",
        headers: new Headers({
          Authorization: "Bearer " + (await refreshToken()),
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          location: "USGov Virginia",
          properties: {
            enableAcceleratedNetworking: false,
            ipConfigurations: [
              {
                name: "ipconfig1",
                properties: {
                  publicIPAddress: {
                    id:
                      "/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/virtual-machines/providers/Microsoft.Network/publicIPAddresses/" +
                      ipAddress
                  },
                  subnet: {
                    id:
                      "/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/virtual-machines/providers/Microsoft.Network/virtualNetworks/vnet/subnets/default"
                  }
                }
              }
            ]
          }
        })
      }
    ).catch(err => res.status(500).send(err));
    const response = await call.json();
    // why this wierd recursive shit?
    // because the public IP is created with a "Pending" status
    // and if the createNetworkInterface() is called, and attempts to reference the IP while still pending,
    // then it'll throw
    // so...keep calling createNetworkInterface() until it doesn't throw
    if (response.name) {
      return;
    } else {
      await createNetworkInterface(req.query.serverName);
    }
  };

  const createVM = async () => {
    await fetch(
      "https://management.usgovcloudapi.net/subscriptions/" +
        process.env.SUBSCRIPTION +
        "/resourceGroups/virtual-machines/providers/Microsoft.Compute/virtualMachines/" +
        req.query.serverName +
        "?api-version=2018-06-01",
      {
        method: "PUT",
        headers: new Headers({
          Authorization: "Bearer " + (await refreshToken()),
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          location: "USGov Virginia",
          properties: {
            hardwareProfile: {
              vmSize: vmSize
            },
            osProfile: {
              adminPassword: process.env.VM_PASSWORD,
              adminUsername: process.env.VM_USERNAME,
              computerName: req.query.serverName,
              linuxConfiguration: {
                disablePasswordAuthentication: false
              }
            },
            storageProfile: {
              imageReference: {
                sku: "18.04-LTS",
                publisher: "Canonical",
                version: "latest",
                offer: "UbuntuServer"
              },
              osDisk: {
                caching: "ReadWrite",
                managedDisk: {
                  storageAccountType: "Standard_LRS"
                },
                name: req.query.serverName,
                createOption: "FromImage"
              }
            },
            networkProfile: {
              networkInterfaces: [
                {
                  id:
                    "/subscriptions/" +
                    process.env.SUBSCRIPTION +
                    "/resourceGroups/virtual-machines/providers/Microsoft.Network/networkInterfaces/" +
                    req.query.serverName,
                  properties: {
                    primary: true
                  }
                }
              ]
            }
          }
        })
      }
    )
      .then(res => res.json())
      .then(data => {
        res.status(200).send(data);
      })
      .then(() => tellBaloo({ type: "VM", name: req.query.serverName }))
      .catch(err => res.status(500).send(err));
  };

  createIPAddress()
    .then(await createNetworkInterface)
    .then(await createVM);
});

const tellBaloo = activity => {
  fetch("https://baloo.azurewebsites.us/azMonitor/activity", {
    method: "POST",
    headers: new Headers({
      Authorization: "Bearer " + process.env.BALOO,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      activity: "Provision",
      type: activity.type,
      service: activity.name
    })
  });
};

module.exports = router;
