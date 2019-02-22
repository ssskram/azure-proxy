const dt = require("node-json-transform").DataTransform

const metric = {
    list: 'value',
    item: {
        type: 'name.localizedValue',
        unit: 'unit',
        startTime: 'startTime',
        endTime: 'endTime',
        metrics: 'metricValues'
    },
    operate: [{
        'run': (ary) => dt({list: ary}, values).transform(),
        'on': 'metrics'
    }]
}

const values = {
    'list': 'list',
    'item': {
        'timestamp': 'timestamp',
        'average': 'average'
    }
}

module.exports = {
    metric
}