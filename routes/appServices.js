const express = require('express')
const router = express.Router()
const checkToken = require('../token')
const refreshToken = require('../refresh')
const fetch = require('node-fetch')
const dt = require('node-json-transform').DataTransform
const models = require('../models/appServices')
const metrics = require('../models/metrics')

global.Headers = fetch.Headers

// return all application services
router.get('/allServices',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/app-services/providers/Microsoft.Web/serverfarms?api-version=2016-09-01", {
                    method: 'get',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + await refreshToken(),
                        'Accept': 'application/json'
                    })
                })
                .then(res => res.json())
                .then(data => {
                    res.status(200).send(dt(data, models.appService).transform())
                })
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

// return CPU metrics per application service
router.get('/cpu',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/" + req.query.serviceName + "/metrics?$filter=name.value eq 'CpuPercentage'&api-version=2016-09-01", {
                    method: 'get',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + await refreshToken(),
                        'Accept': 'application/json'
                    })
                })
                .then(res => res.json())
                .then(data => {
                    res.status(200).send(dt(data, metrics.metric).transform())
                })
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

// return memory metrics per application service
router.get('/memory',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/" + req.query.serviceName + "/metrics?$filter=name.value eq 'MemoryPercentage'&api-version=2016-09-01", {
                    method: 'get',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + await refreshToken(),
                        'Accept': 'application/json'
                    })
                })
                .then(res => res.json())
                .then(data => {
                    res.status(200).send(dt(data, metrics.metric).transform())
                })
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

module.exports = router