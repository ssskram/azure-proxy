const express = require('express')
const router = express.Router()
const checkToken = require('../token')
const refreshToken = require('../refresh')
const fetch = require('node-fetch')
const dt = require('node-json-transform').DataTransform
const models = require('../models/applications')

global.Headers = fetch.Headers

// spin up new service in api resource group
router.post('/api',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/api-applications/providers/Microsoft.Web/sites/" + req.query.appName + "?api-version=2016-08-01", {
                method: 'PUT',
                headers: new Headers({
                    'Authorization': 'Bearer ' + await refreshToken(),
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    kind: 'api',
                    location: 'USGov Virginia',
                    properties: {
                        httpsOnly: true,
                        serverFarmId: '/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/api-apps-1'
                    }
                })
            })
                .then(res => res.json())
                .then(data => res.status(200).send({
                    name: data.name,
                    status: data.properties.state,
                    url: data.properties.defaultHostName,
                    resourceGroup: data.properties.resourceGroup
                }))
                .catch(err => res.status(500).send(err))

        } else res.status(403).end()
    }
)

// spin up new service in client resource group
router.post('/client',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/client-applications/providers/Microsoft.Web/sites/" + req.query.appName + "?api-version=2016-08-01", {
                method: 'PUT',
                headers: new Headers({
                    'Authorization': 'Bearer ' + await refreshToken(),
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    kind: 'app',
                    location: 'USGov Virginia',
                    properties: {
                        httpsOnly: true,
                        serverFarmId: '/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/client-apps-1'
                    }
                })
            })
                .then(res => res.json())
                .then(data => res.status(200).send({
                    name: data.name,
                    status: data.properties.state,
                    url: data.properties.defaultHostName,
                    resourceGroup: data.properties.resourceGroup
                }))
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

// spin up new service in serverless resource group
router.post('/lambda',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/lambdas/providers/Microsoft.Web/sites/" + req.query.appName + "?api-version=2016-08-01", {
                method: 'PUT',
                headers: new Headers({
                    'Authorization': 'Bearer ' + await refreshToken(),
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    kind: 'functionapp',
                    location: 'USGov Virginia',
                    properties: {
                        httpsOnly: true,
                        serverFarmId: '/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/serverless-apps-1'
                    }
                })
            })
                .then(res => res.json())
                .then(data => res.status(200).send({
                    name: data.name,
                    status: data.properties.state,
                    url: data.properties.defaultHostName,
                    resourceGroup: data.properties.resourceGroup
                }))
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

module.exports = router