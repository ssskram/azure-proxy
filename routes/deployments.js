const express = require("express");
const router = express.Router();
const refreshToken = require("../refresh");
const fetch = require("node-fetch");
const dt = require("node-json-transform").DataTransform;
const models = require("../models/deployments");

// return source control per service
router.get("/sourceControl", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/" +
      req.query.resourceGroup +
      "/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "/sourcecontrols/web?api-version=2016-08-01",
    {
      method: "get",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken()),
        Accept: "application/json"
      })
    }
  )
    .then(res => res.json())
    .then(data =>
      res
        .status(200)
        .send({ repo: data.properties.repoUrl, branch: data.properties.branch })
    )
    .catch(err => res.status(500).send(err));
});

// delete source control per service
router.delete("/sourceControl", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/" +
      req.query.resourceGroup +
      "/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "/sourcecontrols/web?api-version=2016-08-01",
    {
      method: "DELETE",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken())
      })
    }
  )
    .then(() => res.status(200).send())
    .catch(err => res.status(500).send(err));
});

// set source control
router.post("/sourceControl", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/" +
      req.query.resourceGroup +
      "/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "/sourcecontrols/web?api-version=2016-08-01",
    {
      method: "PATCH",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken()),
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        properties: {
          repoUrl: req.body.url,
          branch: req.body.branch,
          isManualIntegration: true,
          deploymentRollbackEnabled: false,
          isMercurial: false
        }
      })
    }
  )
    .then(res => res.json())
    .then(data =>
      res.status(200).send({
        repo: data.properties.repoUrl,
        branch: data.properties.branch
      })
    )
    .catch(err => res.status(500).send(err));
});

// return deployments per service
router.get("/allDeployments", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/" +
      req.query.resourceGroup +
      "/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "/deployments?api-version=2016-08-01",
    {
      method: "get",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken()),
        Accept: "application/json"
      })
    }
  )
    .then(res => res.json())
    .then(data => res.status(200).send(dt(data, models.deployment).transform()))
    .catch(err => res.status(500).send(err));
});

// deploy
router.post("/syncSource", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/" +
      req.query.resourceGroup +
      "/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "/sync?api-version=2016-08-01",
    {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken())
      })
    }
  )
    .then(response => res.status(200).send(response.status))
    .then(() => tellBaloo(req.query.appName))
    .catch(err => res.status(500).send(err));
});

const tellBaloo = appName => {
  fetch("https://baloo.azurewebsites.us/azMonitor/activity", {
    method: "POST",
    headers: new Headers({
      Authorization: "Bearer " + process.env.BALOO,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      activity: "Deployment",
      service: appName
    })
  });
};

module.exports = router;
