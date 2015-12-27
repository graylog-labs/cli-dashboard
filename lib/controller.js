var graylog = require("./graylog-api.js")
var ui = require("./screen.js")
var handlers = require("./handlers.js")
var ticker = {
	msg: 0,
	stream: 0,
	total: 0,
	alert: 0
}

module.exports = {
	config: {},
	setupHandler: function() {
		var _this=this
		ticker.msg = setInterval(function() {
			graylog.lastMessagesOfStream({
				serverUrl: _this.config.serverUrl,
				streamId: _this.config.streamId,
				mainQuery: _this.config.mainq,
				username: _this.config.apiUser,
				password: _this.config.apiPass
			}, handlers.updateMessagesList)
		}, 1000)
		ticker.stream = setInterval(function() {
			graylog.streamThroughput({
				serverUrl: _this.config.serverUrl,
				streamId: _this.config.streamId,
				username: _this.config.apiUser,
				password: _this.config.apiPass
			}, handlers.updateStreamThroughput)
		}, 1000)
		ticker.total = setInterval(function() {
			graylog.totalThroughput({
				serverUrl: _this.config.serverUrl,
				username: _this.config.apiUser,
				password: _this.config.apiPass
			}, handlers.updateTotalThroughputLine)
		}, 1000)
		ticker.alert = setInterval(function() {
			graylog.streamAlerts({
				serverUrl: _this.config.serverUrl,
				streamId: _this.config.streamId,
				username: _this.config.apiUser,
				password: _this.config.apiPass
			}, handlers.renderAlerts)
		}, 1000)
	},
	slaveHandler: function() {
		var _this=this

		ticker.msg = setInterval(function() {
			graylog.lastMessagesOfStream({
				serverUrl: _this.config.serverUrl,
				streamId: _this.config.streamId,
				mainQuery: _this.config.mainq,
				username: _this.config.apiUser,
				password: _this.config.apiPass
			}, handlers.updateMessagesList)
		}, 1000)
		ticker.stream = setInterval(function() {
			graylog.lastMessagesOfStream({
				serverUrl: _this.config.serverUrl,
				streamId: _this.config.slaveStream,
				username: _this.config.apiUser,
				password: _this.config.apiPass
			}, handlers.updateSlaveList)
		}, 1000)
	},
	resetHandler: function() {
		for (var i in ticker) {
			clearInterval(i);
		}
	}
}