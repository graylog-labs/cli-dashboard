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

	updateMessagesList(messages) {
		const messageList = ui.getWidget('messageList');

		const items = messages
		.sort((message1, message2) => new Date(message1.timestamp) - new Date(message2.timestamp))
		.map((message) => `${moment(message.timestamp).format()} - ${message.message}`);

		messageList.setItems(items);
	},

	updateTotalThroughputLine(throughput) {
		const throughputLine = ui.getWidget('totalThroughput');

		// Manage local data array.
		if(totalThroughputData.length >= 300) {
			totalThroughputData.shift();
		}
		totalThroughputData.push({x: moment().format("HH:mm"), y: throughput});

		throughputLine.setData(transformLineData(totalThroughputData));
	},

	updateStreamThroughput(throughput) {
		if (!throughput) throughput = 0;
		// Update in title of log messages widget.
		const messageList = ui.getWidget('messageList');
		const label = getWidgetLabel(messageList);
		messageList.setLabel(label.replace(/(Throughput: )(\d+)/, "$1" + throughput));

		// Update in chart.
		const throughputLine = ui.getWidget('streamThroughput');

		// Manage local data array.
		while(streamThroughputData.length >= 300) {
			streamThroughputData.shift();
		}
		streamThroughputData.push({x: moment().format("HH:mm"), y: throughput});

		throughputLine.setData(transformLineData(streamThroughputData));
	},

	updateStreamsList(streams) {
		const streamsList = ui.getWidget('streamsList');
		streamsList.setItems(streams.map((s) => s.title));
		streamsList.focus();
	},

	renderAlerts(alertList) {
		const alerts = ui.getWidget('alerts');
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

// Blessed-contrib expects an object with x/y array datapoints.
function transformLineData(dataArray) {
	return dataArray.reduce((memo, d) => {
		memo.x.push(d.x);
		memo.y.push(d.y);
		return memo;
	}, {x: [], y: []});
}

function buildAlertDescription(i, alert) {
	return `{red-fg}#${i + 1}:{/red-fg} ${alert.condition.type} alert. (Condition created by ${alert.condition.creator_user_id})`;
}

// We can't just get the label from options, it'll be stale.
function getWidgetLabel(widget) {
	return widget.children.find((c) => c._isLabel).content;
}
