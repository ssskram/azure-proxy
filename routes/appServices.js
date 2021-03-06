const express = require("express");
const router = express.Router();
const refreshToken = require("../refresh");
const fetch = require("node-fetch");
const dt = require("node-json-transform").DataTransform;
const models = require("../models/appServices");

// return all application services
router.get("/allServices", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/app-services/providers/Microsoft.Web/serverfarms?api-version=2016-09-01",
    {
      method: "get",
      headers: new Headers({
        Authorization: "Bearer " + (await refreshToken()),
        Accept: "application/json"
      })
    }
  )
    .then(res => res.json())
    .then(data => {
      res.status(200).send(dt(data, models.appService).transform());
    })
    .catch(err => res.status(500).send(err));
});

module.exports = router;
