/**
 * This file is part of Graylog2.
 *
 * Graylog2 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog2 is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog2.  If not, see <http://www.gnu.org/licenses/>.
 */


var request = require('request')

module.exports = {

  streamAlerts: function(options, callback) {
    var url = options.serverUrl + "streams/" + options.streamId + "/alerts/check"

    request({uri: url, json: true}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body)
      } else {
        if(response == undefined) {
          console.log("Could not get alerts of stream. Error: " + error)
        } else {
          console.log("Could not get alerts of stream. Error: HTTP " + response.statusCode)
        }
      }
    }).auth(options.username, options.password, false)
  },

  lastMessagesOfStream: function(options, callback) {
    var url = options.serverUrl + "search/universal/relative"
    if ( !options.mainQuery) options.mainQuery='*';
    var parameters = {
      query: options.mainQuery,
      range: 10000,
      fields: "_id,timestamp,source,message",
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
    var url = options.serverUrl + "system/metrics/org.graylog2.plugin.streams.Stream." + options.streamId + ".incomingMessages.1-sec-rate"

    request({uri: url, json: true}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body.value)
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
    var url = options.serverUrl + "system/throughput"

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
