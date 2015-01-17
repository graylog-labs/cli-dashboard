#!/usr/bin/env node

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

var argv = require('yargs')
    .usage('Usage: graylog-dashboard --stream-id [stream-id] --host [graylog-server REST API URL]')
    .demand(['s','h'])
    .alias('s', 'stream-id')
    .alias('h', 'host')
    .argv

var streamId = argv.s
var serverUrl = argv.h

var graylog = require("./lib/graylog-api.js")
var ui = require("./lib/screen.js")
var handlers = require("./lib/handlers.js")

/*
 *
 *   ┈╱╱▏┈┈╱╱╱╱▏╱╱▏┈┈┈    ┈╱╱▏┈┈╱╱╱╱▏╱╱▏┈┈┈    ┈╱╱▏┈┈╱╱╱╱▏╱╱▏┈┈┈
 *   ┈▇╱▏┈┈▇▇▇╱▏▇╱▏┈┈┈    ┈▇╱▏┈┈▇▇▇╱▏▇╱▏┈┈┈    ┈▇╱▏┈┈▇▇▇╱▏▇╱▏┈┈┈
 *   ┈▇╱▏▁┈▇╱▇╱▏▇╱▏▁┈┈    ┈▇╱▏▁┈▇╱▇╱▏▇╱▏▁┈┈    ┈▇╱▏▁┈▇╱▇╱▏▇╱▏▁┈┈
 *   ┈▇╱╱╱▏▇╱▇╱▏▇╱╱╱▏┈    ┈▇╱╱╱▏▇╱▇╱▏▇╱╱╱▏┈    ┈▇╱╱╱▏▇╱▇╱▏▇╱╱╱▏┈
 *   ┈▇▇▇╱┈▇▇▇╱┈▇▇▇╱┈┈    ┈▇▇▇╱┈▇▇▇╱┈▇▇▇╱┈┈    ┈▇▇▇╱┈▇▇▇╱┈▇▇▇╱┈┈
 *
 *   I have no clue about JavaScript or even node.js and this is 
 *   going to be pretty terrible code. It is a wonder that I got
 *   it running at all lol.
 *
 *   I wish this was Java.
 *
 *   Have fun in here! (Lennart, 01/2015)
 *
 */

 // Command line arguments parsing.


 ui.grid("topRight").get(1, 0).content = "{center}{green-fg}Not implemented yet!{/green-fg}{/center}"

setInterval(function() {
  graylog.lastMessagesOfStream({
    serverUrl: serverUrl,
    streamId: streamId,
    username: "lennart",
    password: "123123123"
  }, handlers.updateMessagesList)
}, 1000)

setInterval(function() {
  graylog.streamThroughput({
    serverUrl: serverUrl,
    streamId: streamId,
    username: "lennart",
    password: "123123123"
  }, handlers.updateStreamThroughput)
}, 1000)

setInterval(function() {
  graylog.totalThroughput({
    serverUrl: serverUrl,
    username: "lennart",
    password: "123123123"
  }, handlers.updateTotalThroughputLine)
}, 1000)