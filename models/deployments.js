
const moment = require('moment')
const tz = require('moment-timezone')

const dateTransform = (date) => moment(date).tz('America/New_York').format('MM-DD-YYYY, hh:mm A')

const deployment = {
    list: 'value',
    item: {
        author: 'properties.author',
        message: 'properties.message',
        completed: 'properties.end_time',
        active: 'properties.active'
    },
    operate: [{
        'run': dateTransform,
        'on': "completed"
    }]
}

const sourceControl = {
    list: '',
    item: {
        repo: 'properties.repoUrl',
        branch: 'properties.branch'
    }
}

module.exports = {
    deployment,
    sourceControl
}