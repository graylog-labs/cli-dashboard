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

let screen;
let grid;
let topGrid;
let bottomGrid;
let topRightGrid;
let created = false;

module.exports = {

  create() {
    if (created) throw new Error('Screen already created!');
    created = true;

    screen = blessed.screen();
    grid = new contrib.grid({rows: 2, cols: 1});
    topGrid = new contrib.grid({rows: 1, cols: 2});
    bottomGrid = new contrib.grid({rows: 1, cols: 1});
    topRightGrid = new contrib.grid({rows: 2, cols: 1});

    // Set up widgets.
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
    });

    topRightGrid.set(1, 0, blessed.list, {
      label: "Alerts (30s cached)",
      tags: true,
      items: ["loading ..."],
      mouse: true,
      scrollable: true
    });

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
    });

    bottomGrid.set(0, 0, contrib.log, {
      fg: "green",
      selectedFg: "green",
      bufferLength: 50,
      label: "Messages"
    });

    // Arrange grids.

    grid.set(0, 0, topGrid);
    grid.set(1, 0, bottomGrid);
    topGrid.set(0, 1, topRightGrid);
    grid.applyLayout(screen);
    screen.render();

    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
  },

	grid(grid) {
		switch(grid) {
			case "main":
				return grid;
			case "top":
				return topGrid;
			case "bottom":
				return bottomGrid;
			case "topRight":
				return topRightGrid;
		}
	},

	render() {
		screen.render();
	},

  screen: function() {
    return screen;
  },
};
