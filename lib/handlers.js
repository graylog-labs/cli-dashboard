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


var moment = require('moment')
var ui = require("./screen.js")

var totalThroughputData = [ ]
var streamThroughputData = [ ]

module.exports = {

	updateMessagesList: function(messages) {
		var log = ui.grid("bottom").get(0, 0)

		for(var i in messages) {
			var message = messages[i];
			log.log(message.timestamp + " - " + message.message)
		}

		ui.render()
	},

	updateTotalThroughputLine: function(throughput) {
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
	},

	updateStreamThroughput: function(throughput) {
		// Update in title of log messages widget.
		var box = ui.grid("bottom").get(0, 0)
		box.setLabel("Messages (Throughput: " + throughput.toString() + "/sec)")

		// Update in chart.
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
	},

	markAlertsAsEmpty: function() {
		var alerts = ui.grid("topRight").get(1, 0)
		alerts.content = "{center}{green-fg}No active alerts for this stream!{/green-fg}{/center}"
	}

}