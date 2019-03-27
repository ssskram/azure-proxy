const express = require("express");
const router = express.Router();
const refreshToken = require("../refresh");
const fetch = require("node-fetch");

// return application settings per service
router.get("/appSettings", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/" +
      req.query.resourceGroup +
      "/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "/config/appsettings/list?api-version=2016-08-01",
    {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken())
      })
    }
  )
    .then(res => res.json())
    .then(data => res.status(200).send({ settings: data.properties }))
    .catch(err => res.status(500).send(err));
});

router.post("/appSettings", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/" +
      req.query.resourceGroup +
      "/providers/Microsoft.Web/sites/" +
      req.query.appName +
      "/config/appsettings?api-version=2016-08-01",
    {
      method: "PUT",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken()),
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        properties: req.body
      })
    }
  )
    .then(res => res.json())
    .then(data => res.status(200).send({ settings: data.properties }))
    .catch(err => res.status(500).send(err));
});

module.exports = router;
