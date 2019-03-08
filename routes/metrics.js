const express = require('express')
const router = express.Router()
const checkToken = require('../token')
const refreshToken = require('../refresh')
const fetch = require('node-fetch')
const dt = require('node-json-transform').DataTransform
const metrics = require('../models/metrics')

global.Headers = fetch.Headers

// requests on
router.get('/requests',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            const time = await getSpan(req.query.minutes)
            fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/" + req.query.resourceGroup + "/providers/Microsoft.Web/sites/" + req.query.appName + "/metrics?$filter=(name.value eq 'Requests') and startTime eq '" + time.from + "' and endTime eq '" + time.to + "'&api-version=2016-08-01", {
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

// 400 errors
router.get('/fourHundo',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            const time = await getSpan(req.query.minutes)
            fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/" + req.query.resourceGroup + "/providers/Microsoft.Web/sites/" + req.query.appName + "/metrics?$filter=(name.value eq 'Http4xx') and startTime eq '" + time.from + "' and endTime eq '" + time.to + "'&api-version=2016-08-01", {
                method: 'get',
                headers: new Headers({
                    'Authorization': 'Bearer ' + await refreshToken(),
                    'Accept': 'application/json'
                })
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    res.status(200).send(dt(data, metrics.metric).transform())
                })
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

// 500 errors
router.get('/fiveHundo',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            const time = await getSpan(req.query.minutes)
            fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/" + req.query.resourceGroup + "/providers/Microsoft.Web/sites/" + req.query.appName + "/metrics?$filter=(name.value eq 'Http5xx') and startTime eq '" + time.from + "' and endTime eq '" + time.to + "'&api-version=2016-08-01", {
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

// return CPU metrics per application service
router.get('/cpu',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            const time = await getSpan(req.query.minutes)
            fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/" + req.query.serviceName + "/metrics?$filter=(name.value eq 'CpuPercentage') and startTime eq '" + time.from + "' and endTime eq '" + time.to + "'&api-version=2016-09-01", {
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
            const time = await getSpan(req.query.minutes)
            fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/" + req.query.serviceName + "/metrics?$filter=(name.value eq 'MemoryPercentage') and startTime eq '" + time.from + "' and endTime eq '" + time.to + "'&api-version=2016-09-01", {
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

const getSpan = span => {
    const now = new Date()
    const from = new Date()
    from.setMinutes(from.getMinutes() - span)
    return {
        from: from.toISOString(),
        to: now.toISOString()
    }
}

module.exports = router