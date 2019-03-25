const express = require('express')
const router = express.Router()
const refreshToken = require('../refresh')
const fetch = require('node-fetch')
const uuid = require('uuid/v1')

// spin up new service in api resource group
router.post('/api', (req, res) => {
    fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/api-applications/providers/Microsoft.Web/sites/" + req.query.appName + "?api-version=2016-08-01", {
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
                serverFarmId: '/subscriptions/' + process.env.SUBSCRIPTION + '/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/api-apps-1',
                siteConfig: {
                    use32BitWorkerProcess: false,
                    httpLoggingEnabled: true,
                    appSettings: [
                        { name: 'WEBSITE_HTTPLOGGING_RETENTION_DAYS', value: '30' },
                        { name: 'ASPNETCORE_ENVIRONMENT', value: 'Production' },
                        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '8.11.1' },
                        { name: 'BEARER', value: await uuid() }
                    ]
                }
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
        .then(() => tellBaloo({ type: 'API', name: req.query.appName }))
        .catch(err => res.status(500).send(err))
})

// spin up new service in client resource group
router.post('/client', async (req, res) => {
    fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/client-applications/providers/Microsoft.Web/sites/" + req.query.appName + "?api-version=2016-08-01", {
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
                serverFarmId: '/subscriptions/' + process.env.SUBSCRIPTION + '/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/client-apps-1',
                siteConfig: {
                    use32BitWorkerProcess: false,
                    httpLoggingEnabled: true,
                    appSettings: [
                        { name: 'WEBSITE_HTTPLOGGING_RETENTION_DAYS', value: '30' },
                        { name: 'ASPNETCORE_ENVIRONMENT', value: 'Production' },
                        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '8.11.1' },
                        { name: 'REACT_APP_365_API', value: process.env.REACT_APP_365_API },
                        { name: 'REACT_APP_CART_API', value: process.env.REACT_APP_CART_API },
                        { name: 'REACT_APP_GOOGLE_API', value: process.env.REACT_APP_GOOGLE_API },
                        { name: 'REACT_APP_SENDGRID_API', value: process.env.REACT_APP_SENDGRID_API },
                        { name: 'REACT_APP_MONGO', value: process.env.REACT_APP_MONGO },
                        { name: 'REACT_APP_AZURE_PROXY', value: process.env.REACT_APP_AZURE_PROXY },
                        { name: 'REACT_APP_BLOBLY_API', value: process.env.REACT_APP_BLOBLY_API }
                    ]
                }
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
        .then(() => tellBaloo({ type: 'client', name: req.query.appName }))
        .catch(err => res.status(500).send(err))
})

// spin up new service in serverless resource group
router.post('/lambda', async (req, res) => {
    let appSettings = [
        { name: 'AzureWebJobsStorage', value: process.env.AzureWebJobsStorage },
        { name: 'FUNCTION_APP_EDIT_MODE', value: 'readwrite' },
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~2' },
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '8.11.1' },
        { name: 'WEBSITE_TIME_ZONE', value: 'Eastern Standard Time' },
    ]
    if (req.query.runtime == 'node') {
        appSettings.push({ name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' })
    } else {
        appSettings.push({ name: 'FUNCTIONS_WORKER_RUNTIME', value: 'dotnet' })
    }
    fetch("https://management.usgovcloudapi.net/subscriptions/" + process.env.SUBSCRIPTION + "/resourceGroups/lambdas/providers/Microsoft.Web/sites/" + req.query.appName + "?api-version=2016-08-01", {
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
                serverFarmId: '/subscriptions/' + process.env.SUBSCRIPTION + '/resourceGroups/app-services/providers/Microsoft.Web/serverfarms/serverless-apps-1',
                siteConfig: {
                    alwaysOn: true,
                    use32BitWorkerProcess: false,
                    appSettings: appSettings,
                    cors: {
                        allowedOrigins: [
                            '*'
                        ]
                    }
                }
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
        .then(() => tellBaloo({ type: 'lambda', name: req.query.appName }))
        .catch(err => res.status(500).send(err))
})

const tellBaloo = activity => {
    fetch("https://baloo.azurewebsites.us/azMonitor/activity", {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + process.env.BALOO,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            activity: "Provision",
            type: activity.type,
            service: activity.name
        })
    })
}

module.exports = router