#!/usr/bin/env node
'use strict';

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

const fs = require('fs');
const yaml = require('js-yaml');
const argv = require('yargs')
    .usage('Usage: graylog-dashboard --stream-id [stream-id] --host [graylog-server REST API URL]')
    .demand(['h'])
    .alias('s', 'stream-id')
    .alias('h', 'host')
    .argv;

const Promise = require('bluebird');
const graylog = require('./lib/graylog-api');
const ui = require('./lib/screen');
const handlers = require('./lib/handlers');

// CLI arguments
let serverURL = argv.h;

// Make sure serverURL has a trailing slash. (computers.)
if (serverURL[serverURL.length - 1] !== '/') serverURL += '/';

// Read user credentials.
const credFilePath = process.env['HOME'] + "/.graylog_dashboard";
let config;
try {
  config = yaml.safeLoad(fs.readFileSync(credFilePath, 'utf8'));
} catch (err) {
  throw new Error(`Could not read Graylog user credentials file at ${credFilePath} - Please create it ` +
                  `as described in the README. (${err.message})`);
}

// Check config.
['username', 'password'].forEach((k) => {
  if (!config[k]) throw new Error(`No ${k} defined in ${credFilePath}.`);
});

const {username, password, poll_interval = 1000} = config;

let streamID = argv.s; // may be null
let streams; // filled in after streams runs

function storeStreams(_streams) {
  streams = _streams;
  if (!streamID) streamID = streams[0].id;
  ui.flush(streams.find((s) => s.id === streamID).title);
}

function onStreamChange(blessedEl) {
  const streamTitle = blessedEl.content;
  streamID = streams.find((s) => s.title === streamTitle).id;
  ui.flush(streamTitle);
}

function poll() {
  return Promise.all([
    graylog.lastMessagesOfStream({serverURL, streamID, username, password}).then(handlers.updateMessagesList),
    graylog.streamThroughput({serverURL, streamID, username, password}).then(handlers.updateStreamThroughput),
    graylog.totalThroughput({serverURL, username, password}).then(handlers.updateTotalThroughputLine),
    graylog.streamAlerts({serverURL, streamID, username, password}).then(handlers.renderAlerts),
  ])
  .then(() => ui.render()) // batch up renders
  .delay(poll_interval)
  .then(() => poll(streamID));
}

// Entry
ui.create({onStreamChange});
// Get streams first
graylog.streams({serverURL, username, password})
.tap(storeStreams)
.then(handlers.updateStreamsList)
.then(poll)
.catch((e) => { ui.screen.destroy(); console.error(e); process.exit(1); });
