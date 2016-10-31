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


const moment = require('moment');
const ui = require('./screen');

const totalThroughputData = [];
const streamThroughputData = [];

module.exports = {

	updateMessagesList: function(messages) {
		const messageList = ui.grid("bottom").get(0, 0);

		const items = messages
		.sort((message1, message2) => new Date(message1.timestamp) - new Date(message2.timestamp))
		.map((message) => `${moment(message.timestamp).format()} - ${message.message}`);

		messageList.setItems(items);
	},

	updateTotalThroughputLine: function(throughput) {
		const throughputLine = ui.grid("topRight").get(0, 0);

		// Manage local data array.
		if(totalThroughputData.length >= 300) {
			totalThroughputData.shift();
		}
		totalThroughputData.push({x: moment().format("HH:mm"), y: throughput});

		const x = [];
		const y = [];
		for(const i in totalThroughputData) {
			x.push(totalThroughputData[i].x);
			y.push(totalThroughputData[i].y);
		}

		throughputLine.setData(x, y);
		ui.render();
	},

	updateStreamThroughput: function(throughput) {
		// Update in title of log messages widget.
		const box = ui.grid("bottom").get(0, 0);
		box.setLabel("Messages (Throughput: " + throughput.toString() + "/sec)");

		// Update in chart.
		const throughputLine = ui.grid("top").get(0, 0);

		// Manage local data array.
		while(streamThroughputData.length >= 300) {
			streamThroughputData.shift();
		}
		streamThroughputData.push({x: moment().format("HH:mm"), y: throughput});

		const x = [];
		const y = [];
		for(const i in streamThroughputData) {
			x.push(streamThroughputData[i].x);
			y.push(streamThroughputData[i].y);
		}

		throughputLine.setData(x, y);
		ui.render();
	},

	renderAlerts: function(alertList) {
		const alerts = ui.grid("topRight").get(1, 0);
		const lines = [];

		if(alertList.total_triggered == 0) {
			lines.push(""); // Empty line as padding.
			lines.push("{center}{green-fg}No active alerts for this stream!{/green-fg}{/center}");
		} else {
			// Stream has active alerts!
			let msg;
			if (alertList.total_triggered == 1) {
				msg = "One active stream alert:";
			} else {
				msg = "Multiple (" + alertList.total_triggered + ") active stream alerts:";
			}

			lines.push(`{center}{red-bg}!! ${msg} !!{/red-bg}{/center}`);
			lines.push("");

			// Add alerts to list.
			for(const i in alertList.results) {
				lines.push(buildAlertDescription(i, alertList.results[i]));
			}

			lines.push("");
			lines.push("{center}Open your Graylog web interface for alert details.{/center}");
		}

		alerts.setItems(lines);
	}

};

function buildAlertDescription(i, alert) {
	return `{red-fg}#${i + 1}:{/red-fg} ${alert.condition.type} alert. (Condition created by ${alert.condition.creator_user_id})`;
}
