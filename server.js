const express = require('express')
const bodyParser = require('body-parser')
const bearerToken = require('express-bearer-token')
const cors = require('cors')

// import env variables
require('dotenv').config()

// start express
var app = express()
app.set('port', process.env.PORT || 3000)

// docs
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// bearer token
app.use(bearerToken())

// body parser
app.use(bodyParser.json())

// enable cors on all requests
app.use(cors())

// logging
app.use(require('morgan')('combined'))

// routes
app.use("/appservices", require('./routes/appServices'))
app.use("/clientApps", require('./routes/clientApplications'))
app.use("/apiApps", require('./routes/apiApplications'))
app.use("/serverlessApps", require('./routes/serverlessApplications'))
app.use("/deployments", require('./routes/deployments'))
app.use("/metrics", require('./routes/metrics'))

// production error handler
if (app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.sendStatus(err.status || 500)
  })
}

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
})