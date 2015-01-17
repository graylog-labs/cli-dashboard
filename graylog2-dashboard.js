var moment = require('moment')

var graylog = require("./lib/graylog-api.js")
var ui = require("./lib/screen.js")


/****************************************/

/**** GRID SETUP ****/



/**** HANDLERS ****/

function updateMessagesList(messages) {
  var log = ui.grid("bottom").get(0, 0)

  for(var i in messages) {
    var message = messages[i];
    log.log(message.timestamp + " - " + message.message)
  }

  ui.render()
}

function updateStreamThroughput(throughput) {
  var box = ui.grid("bottom").get(0, 0)
  box.setLabel("Messages (Throughput: " + throughput.toString() + "/sec)")

  // Also update stream throughput chart.
  updateStreamThroughputLine(throughput)
}

var streamThroughputData = [ ]
function updateStreamThroughputLine(throughput) {
  var throughputLine = ui.grid("top").get(0, 0)

  // Manage local data array.
  if(streamThroughputData.length >= 300) {
    streamThroughputData.shift()
  }
  streamThroughputData.push({x: moment().format("HH:mm"), y: throughput})

  var x = []
  var y = []
  for(var i in streamThroughputData) {
    x.push(streamThroughputData[i].x)
    y.push(streamThroughputData[i].y)
  }

  throughputLine.setData(x, y)
  ui.render()
}

var totalThroughputData = [ ]
function updateTotalThroughputLine(throughput) {
  var throughputLine = ui.grid("topRight").get(0, 0)

  // Manage local data array.
  if(totalThroughputData.length >= 300) {
    totalThroughputData.shift()
  }
  totalThroughputData.push({x: moment().format("HH:mm"), y: throughput})

  var x = []
  var y = []
  for(var i in totalThroughputData) {
    x.push(totalThroughputData[i].x)
    y.push(totalThroughputData[i].y)
  }

  throughputLine.setData(x, y)
  ui.render()
}

function markAlertsAsEmpty() {
  var alerts = ui.grid("topRight").get(1, 0)
  alerts.content = "{center}{green-fg}No active alerts for this stream!{/green-fg}{/center}"
}

/**** UPDATING DATA ****/

setInterval(function() {
  graylog.lastMessagesOfStream({
    serverUrl: "http://localhost:12900",
    streamId: "549d7f9fbee84e568d181655",
    username: "lennart",
    password: "123123123"
  }, updateMessagesList)
}, 1000)

setInterval(function() {
  graylog.streamThroughput({
    serverUrl: "http://localhost:12900",
    streamId: "549d7f9fbee84e568d181655",
    username: "lennart",
    password: "123123123"
  }, updateStreamThroughput)
}, 1000)

setInterval(function() {
  graylog.totalThroughput({
    serverUrl: "http://localhost:12900",
    username: "lennart",
    password: "123123123"
  }, updateTotalThroughputLine)
}, 1000)

ui.render()