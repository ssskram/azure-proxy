const express = require("express");
const router = express.Router();
const refreshToken = require("../refresh");
const fetch = require("node-fetch");
const dt = require("node-json-transform").DataTransform;
const models = require("../models/applications");

// return all api applications
router.get("/allApis", async (req, res) => {
  fetch(
    "https://management.usgovcloudapi.net/subscriptions/" +
      process.env.SUBSCRIPTION +
      "/resourceGroups/api-applications/providers/Microsoft.Web/sites?api-version=2016-08-01",
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
      res.status(200).send(
        dt(data, models.app)
          .transform()
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    })
    .catch(err => res.status(500).send(err));
});

module.exports = router;
