
// using the refresh token generated by sharepoint,
// returns a fresh access token that is good for like, 12 hours or something

const fetch = require('node-fetch')
const toBody = require('./util/objectToParams')

global.Headers = fetch.Headers

const refreshToken = async () => {
    const params = {
        grant_type: process.env.CLIENT_TYPE,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        resource: process.env.CLIENT_RESOURCE
    }
    const token = await fetch('https://login.microsoftonline.us/2a24e990-e095-4bbc-a32f-3712d931583a/oauth2/token', {
        method: 'post',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body: toBody(params)
    })
    const response = await token.json()
    return response.access_token
}

module.exports = refreshToken