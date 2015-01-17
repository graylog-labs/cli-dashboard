var request = require('request')

module.exports = {

  lastMessagesOfStream: function(options, callback) {
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
  },

  streamThroughput: function(options, callback) {
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
  },

  totalThroughput: function(options, callback) {
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

};