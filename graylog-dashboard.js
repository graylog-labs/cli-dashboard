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

const Promise = require('bluebird');
const graylog = require('./lib/graylog-api');
const ui = require('./lib/screen');
const handlers = require('./lib/handlers');
const fs = require('fs');
const yaml = require('js-yaml');
const yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .describe('stream-id', 'Graylog Stream ID')
  .describe('host', 'Full Graylog REST API URL')
  .describe('poll-interval', 'How often (in ms) to poll the Graylog server')
  .default('poll-interval', 1000)
  .describe('username', 'Graylog username')
  .describe('password', 'Graylog password')
  .describe('cred-file-path', 'Path to an optional credentials file')
  .default('cred-file-path', `${process.env.HOME}/.graylog_dashboard`)
  .help();
const {argv} = yargs;

// Read user credentials.
let fileConfig = {};
const {'cred-file-path': credFilePath} = argv;
try {
  fileConfig = yaml.safeLoad(fs.readFileSync(argv.credFilePath, 'utf8'));
} catch (err) {
  // Ignore, maybe everything was defined in argv
}

// Remove falsy values from argv to clean up merge.
Object.keys(argv).forEach((k) => {
  if (!argv[k]) delete argv[k];
});
// Merge argv & file config.
const config = Object.assign({}, fileConfig, argv);

// Check mandatory config.
['username', 'password', 'host'].forEach((k) => {
  if (!config[k]) {
    console.error(`Error: No ${k} defined in ${credFilePath} or arguments!`);
    yargs.showHelp();
    process.exit(1);
  }
});

// eslint-disable-next-line prefer-const
let {username, password, 'stream-id': streamID, host: serverURL, 'poll-interval': pollInterval} = config;

// Make sure we have a protocol (default: https)
if (serverURL.slice(0, 4) !== 'http') serverURL = 'https://' + serverURL;
// Make sure we have a port (default REST API port is 12900)
if (!/:\d+$/.test(serverURL)) serverURL += ':12900';
// Make sure serverURL has a trailing slash. (computers.)
if (serverURL[serverURL.length - 1] !== '/') serverURL += '/';

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
  .delay(pollInterval)
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
