const express = require('express')
const router = express.Router()
const refreshToken = require('../refresh')
const fetch = require('node-fetch')
const dt = require('node-json-transform').DataTransform
const models = require('../models/applications')
const metrics = require('../models/metrics')

// return all lambda services
router.get('/allServerlessApps', async (req, res) => {
    fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/lambdas/providers/Microsoft.Web/sites?api-version=2016-08-01", {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + await refreshToken(),
            'Accept': 'application/json'
        })
    })
        .then(res => res.json())
        .then(data => {
            res.status(200).send(dt(data, models.app).transform().sort((a, b) => a.name.localeCompare(b.name)))
        })
        .catch(err => res.status(500).send(err))
})

// return all functions per lambda service
router.get('/allFunctions', async (req, res) => {
    fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/lambdas/providers/Microsoft.Web/sites/" + req.query.appName + "/functions?api-version=2016-08-01", {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + await refreshToken(),
            'Accept': 'application/json'
        })
    })
        .then(res => res.json())
        .then(data => {
            res.status(200).send(dt(data, models.func).transform())
        })
        .catch(err => res.status(500).send(err))
})

// requests on lambdas
router.get('/requests', async (req, res) => {
    fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/client-applications/providers/Microsoft.Web/sites/" + req.query.appName + "/metrics?$filter=name.value eq 'Requests'&api-version=2016-08-01", {
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
})

// 400 errors
router.get('/fourHundo', async (req, res) => {
    fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/client-applications/providers/Microsoft.Web/sites/" + req.query.appName + "/metrics?$filter=name.value eq 'Http4xx'&api-version=2016-08-01", {
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
})

// 500 errors
router.get('/fiveHundo', async (req, res) => {
    fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/client-applications/providers/Microsoft.Web/sites/" + req.query.appName + "/metrics?$filter=name.value eq 'Http5xx'&api-version=2016-08-01", {
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
})

module.exports = router