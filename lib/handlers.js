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

var totalThroughputData = {x:[],y:[]}
var streamThroughputData = {x:[],y:[]}

module.exports = {

	updateMessagesList: function(messages) {
		var log = ui.grid("bottom")//.get(0, 0)

		for(var i in messages) {
			var message = messages[i];
            var dtx = new Date(message.timestamp);
            log.log(dtx.getHours()+':'+dtx.getMinutes()+':'+dtx.getSeconds()+ ' - ' + message.source + " : " + message.message)
		}

		ui.render()
	},

	updateTotalThroughputLine: function(throughput) {
		var throughputLine = ui.grid("topRight")//.get(0, 0)

		// Manage local data array.
		if(totalThroughputData.x.length >= 300) {
			totalThroughputData.x.shift()
			totalThroughputData.y.shift()
		}
		totalThroughputData.x.push(moment().format("HH:mm"))
		totalThroughputData.y.push(throughput)

/*
		var x = []
		var y = []
		for(var i in totalThroughputData) {
			x.push(totalThroughputData[i].x)
			y.push(totalThroughputData[i].y)
		}
*/

		throughputLine.setData(totalThroughputData) //x, y)
		ui.render()
	},

	updateStreamThroughput: function(throughput) {
		// Update in title of log messages widget.
		var box = ui.grid("bottom")//.get(0, 0)
		box.setLabel("Messages (Throughput: " + throughput.toString() + "/sec)")

		// Update in chart.
		var throughputLine = ui.grid("top")//.get(0, 0)

		// Manage local data array.
			if(streamThroughputData.x.length >= 300) {
			streamThroughputData.x.shift()
			streamThroughputData.y.shift()
		}
//		streamThroughputData.push({x: moment().format("HH:mm"), y: throughput})
		streamThroughputData.x.push(moment().format("HH:mm"))
		streamThroughputData.y.push(throughput)
/*

		var x = []
		var y = []
		for(var i in streamThroughputData) {
			x.push(streamThroughputData[i].x)
			y.push(streamThroughputData[i].y)
		}
*/

		throughputLine.setData(streamThroughputData) // x, y)
		ui.render()
	},

	renderAlerts: function(alertList) {
		var alerts = ui.grid("alertGrid")//topRight").get(1, 0)
		var lines = []

		if(alertList.total_triggered == 0) {
			lines.push("") // Empty line as padding.
			lines.push("{center}{green-fg}No active alerts for this stream!{/green-fg}{/center}")
		} else {
			// Stream has active alerts!
			var msg;
			if (alertList.total_triggered == 1) {
					msg = "One active stream alert:"
			} else {
					msg = "Multiple (" + alertList.total_triggered + ") active stream alerts:"
			}

			lines.push("{center}{red-bg}!! " + msg + " !!{/red-bg}{/center}")
			lines.push("")

			// Add alerts to list.
			for(var i in alertList.results) {
					lines.push(buildAlertDescription(i, alertList.results[i]))
			}

			lines.push("")
			lines.push("{center}Open your Graylog web interface for alert details.{/center}")
		}

		alerts.setItems(lines)
	}

}

function buildAlertDescription(i, alert) {
	var num = i;
	num++; // javascript, doesn't even matter
	return "{red-fg}#" + num + ":{/red-fg} " + alert.condition.type + " alert. (Condition created by " + alert.condition.creator_user_id + ")"
}
