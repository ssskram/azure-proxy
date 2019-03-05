const express = require('express')
const router = express.Router()
const checkToken = require('../token')
const refreshToken = require('../refresh')
const fetch = require('node-fetch')
const dt = require('node-json-transform').DataTransform

global.Headers = fetch.Headers

// return application settings per service
router.get('/appSettings',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/07fefdba-84eb-4d6b-b398-ab8737a57f95/resourceGroups/" + req.query.resourceGroup + "/providers/Microsoft.Web/sites/" + req.query.appName + "/config/appsettings/list?api-version=2016-08-01", {
                method: 'POST',
                headers: new Headers({
                    'Authorization': 'Bearer ' + await refreshToken()
                })
            })
                .then(res => res.json())
                .then(data => res.status(200).send({ settings: data.properties }))
                .catch(err => res.status(500).send(err))
        } else res.status(403).end()
    }
)

module.exports = router