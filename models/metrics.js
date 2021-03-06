const dt = require("node-json-transform").DataTransform;
const moment = require("moment");
const tz = require("moment-timezone");
const dateTransform = date =>
  moment(date)
    .tz("America/New_York")
    .format("hh:mm A");

const metric = {
  list: "value",
  item: {
    type: "name.localizedValue",
    unit: "unit",
    metrics: "metricValues"
  },
  operate: [
    {
      run: ary =>
        dt(
          {
            list: ary
          },
          values
        ).transform(),
      on: "metrics"
    }
  ]
};

const VMmetric = {
  list: "value",
  item: {
    type: "name.localizedValue",
    unit: "unit",
    metrics: "timeseries"
  },
  operate: [
    {
      run: ary =>
        dt(
          {
            list: ary[0].data
          },
          vmValues
        ).transform(),
      on: "metrics"
    }
  ]
};

const values = {
  list: "list",
  item: {
    timestamp: "timestamp",
    average: "average"
  },
  operate: [
    {
      run: dateTransform,
      on: "timestamp"
    }
  ]
};

const vmValues = {
  list: "list",
  item: {
    timestamp: "timeStamp",
    average: "average"
  },
  operate: [
    {
      run: dateTransform,
      on: "timestamp"
    }
  ]
};

module.exports = {
  metric,
  VMmetric
};
