var blessed = require("blessed");
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


const contrib = require("blessed-contrib");

const positions = {
  // [row, col, rowSpan, colSpan]
  totalThroughput:  [0, 1, 1, 1],
  alerts:           [1, 1, 1, 1],
  streamThroughput: [0, 0, 2, 1],
  messageList:      [2, 0, 2, 2]
};
const widgets = {};

module.exports = {

  create() {
    if (module.exports.creen) throw new Error('Screen already created!');

    const screen = module.exports.screen = blessed.screen();
    const grid = module.exports.grid = new contrib.grid({rows: 4, cols: 2, screen});

    // Set up widgets.
    widgets.totalThroughput = grid.set(...positions.totalThroughput, contrib.line, {
      label: "Total Throughput (max last 5 minutes)",
      style: {
        line: "green",
        text: "green",
        baseline: "white"
      },
      xLabelPadding: 10,
      xPadding: 15,
      showNthLabel: 60
    });

    widgets.alerts = grid.set(...positions.alerts, blessed.list, {
      label: "Alerts (30s cached)",
      tags: true,
      items: ["loading ..."],
      mouse: true,
      scrollable: true
    });

    widgets.streamThroughput = grid.set(...positions.streamThroughput, contrib.line, {
      label: "Stream Throughput (max last 5 minutes)",
      style: {
        line: "red",
        text: "green",
        baseline: "white"
      },
      xLabelPadding: 10,
      xPadding: 15,
      showNthLabel: 60
    });

    widgets.messageList = grid.set(...positions.messageList, contrib.log, {
      fg: "green",
      selectedFg: "green",
      bufferLength: 50,
      label: "Messages"
    });

    screen.render();

    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
  },

  getWidget(name) {
    if (widgets[name]) return widgets[name];
    throw new Error(`Invalid widget name: ${name}. Available widgets: ${Object.keys(widgets)}`);
  },

	render() {
		module.exports.screen.render();
	},
};
