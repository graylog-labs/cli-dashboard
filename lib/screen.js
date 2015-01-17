var blessed = require("blessed")
var contrib = require("blessed-contrib")

var screen = blessed.screen()
var grid = new contrib.grid({rows: 2, cols: 1})
var topGrid = new contrib.grid({rows: 1, cols: 2})
var bottomGrid = new contrib.grid({rows: 1, cols: 1})
var topRightGrid = new contrib.grid({rows: 2, cols: 1})

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

// 

grid.set(0, 0, topGrid)
grid.set(1, 0, bottomGrid)
topGrid.set(0, 1, topRightGrid)

grid.applyLayout(screen)

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

module.exports = {
	
	screen: function() {
		return screen;
	},

	grid: function(grid) {
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

	render: function() {
		screen.render()
	}

}