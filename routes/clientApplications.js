const express = require('express')
const router = express.Router()
const checkToken = require('../token')
const refreshToken = require('../refresh')
const fetch = require('node-fetch')
const dt = require('node-json-transform').DataTransform
const models = require('../models/applications')

global.Headers = fetch.Headers

// return all client applications
router.get('/allClients',
    async function (req, res) {
        const valid = (checkToken(req.token))
        if (valid == true) {
            fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/client-applications/providers/Microsoft.Web/sites?api-version=2016-08-01", {
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
                
        } else res.status(403).end()
    }
)

module.exports = router