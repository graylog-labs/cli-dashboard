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
  totalThroughput:  [0, 2, 1, 2],
  alerts:           [1, 2, 1, 2],
  streamThroughput: [0, 0, 2, 2],
  messageList:      [2, 0, 2, 4],
  streamsList:      [0, 4, 4, 1],
};
const widgets = {};

module.exports = {

  create(options) {
    if (module.exports.screen) throw new Error('Screen already created!');

    const screen = module.exports.screen = blessed.screen({
      autoPadding: true,
      smartCSR: true,
    });
    const grid = module.exports.grid = new contrib.grid({rows: 4, cols: 5, screen});

    // Set up widgets.
    widgets.streamThroughput = grid.set(...positions.streamThroughput, contrib.line, {
      label: "Stream Throughput (max last 5 minutes)",
      style: {
        line: "red",
        text: "green",
        baseline: "white"
      },
      showNthLabel: 60
    });

    widgets.totalThroughput = grid.set(...positions.totalThroughput, contrib.line, {
      label: "Total Throughput (max last 5 minutes)",
      style: {
        line: "green",
        text: "green",
        baseline: "white"
      },
      showNthLabel: 60
    });

    widgets.alerts = grid.set(...positions.alerts, blessed.list, {
      label: "Alerts (30s cached)",
      tags: true,
      items: ["Loading ..."],
      mouse: true,
      scrollable: true
    });

    widgets.messageList = grid.set(...positions.messageList, contrib.log, {
      fg: "green",
      selectedFg: "green",
      bufferLength: 50,
      label: "Messages (Throughput: 0/sec)"
    });

    widgets.streamsList = grid.set(...positions.streamsList, blessed.list, {
      keys: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: true,
      label: 'Available Streams',
      mouse: true,
      border: {type: "line", fg: "cyan"},
      style: {
        selected: {
          bg: 'green',
          bold: true,
          underline: true,
        }
      }
    });

    widgets.streamsList.on('select', options.onStreamChange);

    screen.render();

    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
  },

  flush(streamName, streams) {
    Object.keys(widgets).forEach((key) => {
      const w = widgets[key];
      if (w === widgets.streamsList) {
        const titles = streams.map((s) => s.title);
        w.setItems(titles);
        w.select(titles.indexOf(streamName));
      } else {
        if (w.setData) w.setData([{x: 0, y: 0}]);
        if (w.clearItems) w.clearItems();
      }
      if (w === widgets.messageList || w === widgets.streamThroughput || w === widgets.alerts) {
        const {label} = w.options;
        label.replace(/ \(Stream: .*\)/, '');
        w.setLabel(`${label} (Stream: ${streamName})`);
      }
    });
    module.exports.render();
  },

  getWidget(name) {
    if (widgets[name]) return widgets[name];
    throw new Error(`Invalid widget name: ${name}. Available widgets: ${Object.keys(widgets)}`);
  },

	render() {
		module.exports.screen.render();
	},
};
