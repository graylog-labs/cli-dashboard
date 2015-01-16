var blessed = require("blessed")
var contrib = require("blessed-contrib")
var request = require('request')
var moment = require('moment');

var screen = blessed.screen()

/****************************************/

/**** GRID SETUP ****/

var grid = new contrib.grid({rows: 2, cols: 1})

var topGrid = new contrib.grid({rows: 1, cols: 2})
var bottomGrid = new contrib.grid({rows: 1, cols: 1})

var topRightGrid = new contrib.grid({rows: 2, cols: 1})

topRightGrid.set(0, 0, contrib.line, {
  label: "Total Throughput (max last 5 minutes)",
  style: {
    line: "green",
    text: "green",
    baseline: "white"
  },
  xLabelPadding: 10,
  xPadding: 15,
  showNthLabel: 60
})

topRightGrid.set(1, 0, blessed.box, { label: "Alerts", tags: true })

topGrid.set(0, 0, contrib.line, {
  label: "Stream Throughput (max last 5 minutes)",
  style: {
    line: "red",
    text: "green",
    baseline: "white"
  },
  xLabelPadding: 10,
  xPadding: 15,
  showNthLabel: 60
})

bottomGrid.set(0, 0, contrib.log, {
  fg: "green",
  selectedFg: "green",
  bufferLength: 50,
  label: "Messages"
})

grid.set(0, 0, topGrid)
grid.set(1, 0, bottomGrid)
topGrid.set(0, 1, topRightGrid)

grid.applyLayout(screen)

/**** HANDLERS ****/

var alerts = topRightGrid.get(1, 0);
alerts.content = "{center}{green-fg}No active alerts for this stream!{/green-fg}{/center}"

function updateMessagesList(messages) {
  var log = bottomGrid.get(0, 0)

  for(var i in messages) {
    var message = messages[i];
    log.log(message.timestamp + " - " + message.message)
  }

  screen.render()
}

function updateStreamThroughput(throughput) {
  var box = bottomGrid.get(0, 0)
  box.setLabel("Messages (Throughput: " + throughput.toString() + "/sec)")

  // Also update stream throughput chart.
  updateStreamThroughputLine(throughput)
}

var streamThroughputData = [ ]
function updateStreamThroughputLine(throughput) {
  var throughputLine = topGrid.get(0, 0)

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
    screen.render()
}

var totalThroughputData = [ ]
function updateTotalThroughputLine(throughput) {
  var throughputLine = topRightGrid.get(0, 0)

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
    screen.render()
}


function getLastMessagesOfStream(options, callback) {
  var url = options.serverUrl + "/search/universal/relative"
  var parameters = {
    query: "*",
    range: 86400,
    fields: "timestamp,message",
    filter: "streams:" + options.streamId,
    limit: 50
  }

  request({uri: url, json: true, qs: parameters}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = []
      for(var i in body.messages) {
        result.push(body.messages[i].message)
      }

      callback(result)
    } else {
      if(response == undefined) {
        console.log("Could not get messages of stream. Error: " + error)
      } else {
        console.log("Could not get messages of stream. Error: HTTP " + response.statusCode)
      }
    }
  }).auth(options.username, options.password, false)
}

function getStreamThroughput(options, callback) {
  var url = options.serverUrl + "/streams/" + options.streamId + "/throughput"

  request({uri: url, json: true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body.throughput)
    } else {
      if(response == undefined) {
        console.log("Could not get stream throughput. Error: " + error)
      } else {
        console.log("Could not get stream throughput. Error: HTTP " + response.statusCode)
      }
    }
  }).auth(options.username, options.password, false)
}

function getTotalThroughput(options, callback) {
  var url = options.serverUrl + "/system/throughput"

  request({uri: url, json: true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body.throughput)
    } else {
      if(response == undefined) {
        console.log("Could not get total throughput. Error: " + error)
      } else {
        console.log("Could not get total throughput. Error: HTTP " + response.statusCode)
      }
    }
  }).auth(options.username, options.password, false)
}

/**** UPDATING DATA ****/

setInterval(function() {
  getLastMessagesOfStream({
    serverUrl: "http://localhost:12900",
    streamId: "549d7f9fbee84e568d181655",
    username: "lennart",
    password: "123123123"
  }, updateMessagesList)
}, 1000)

setInterval(function() {
  getStreamThroughput({
    serverUrl: "http://localhost:12900",
    streamId: "549d7f9fbee84e568d181655",
    username: "lennart",
    password: "123123123"
  }, updateStreamThroughput)
}, 1000)

setInterval(function() {
  getTotalThroughput({
    serverUrl: "http://localhost:12900",
    username: "lennart",
    password: "123123123"
  }, updateTotalThroughputLine)
}, 1000)

/**** LE END ****/

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render()