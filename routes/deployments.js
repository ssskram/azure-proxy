const express = require('express')
const router = express.Router()
const checkToken = require('../token')
const refreshToken = require('../refresh')
const fetch = require('node-fetch')
const dt = require('node-json-transform').DataTransform
const models = require('../models/deployments')

global.Headers = fetch.Headers

// return source control per service
router.get('/sourceControl',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/" + req.query.resourceGroup + "/providers/Microsoft.Web/sites/" + req.query.appName + "/sourcecontrols/web?api-version=2016-08-01", {
                method: 'get',
                headers: new Headers({
                    'Authorization': 'Bearer ' + await refreshToken(),
                    'Accept': 'application/json'
                })
            })
                .then(res => res.json())
                .then(data => res.status(200).send({ repo: data.properties.repoUrl, branch: data.properties.branch }))
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

// return deployments per service
router.get('/allDeployments',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/" + req.query.resourceGroup + "/providers/Microsoft.Web/sites/" + req.query.appName + "/deployments?api-version=2016-08-01", {
                method: 'get',
                headers: new Headers({
                    'Authorization': 'Bearer ' + await refreshToken(),
                    'Accept': 'application/json'
                })
            })
                .then(res => res.json())
                .then(data => res.status(200).send(dt(data, models.deployment).transform()))
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

// deploy
router.post('/syncSource',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/" + req.query.resourceGroup + "/providers/Microsoft.Web/sites/" + req.query.appName + "/sync?api-version=2016-08-01", {
                method: 'POST',
                headers: new Headers({
                    'Authorization': 'Bearer ' + await refreshToken()
                })
            })
                .then(response => res.status(200).send(response.status))
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

module.exports = router