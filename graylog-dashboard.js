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
const makeStreamMenu = require('./lib/menu');

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

// Ask the user for a stream ID if one is not specified.
function getStreamID() {
  if (argv.s) return Promise.resolve(argv.s);
  console.log('No stream selected, looking up available streams...');
  // Resolves to a stream ID
  return makeStreamMenu({username, password, serverURL});
}

function poll(streamID) {
  return Promise.all([
    graylog.lastMessagesOfStream({serverURL, streamID, username, password}).then(handlers.updateMessagesList),
    graylog.streamThroughput({serverURL, streamID, username, password}).then(handlers.updateStreamThroughput),
    graylog.totalThroughput({serverURL, username, password}).then(handlers.updateTotalThroughputLine),
    graylog.streamAlerts({serverURL, streamID, username, password}).then(handlers.renderAlerts),
  ])
  .delay(poll_interval)
  .then(() => poll(streamID));
}

// Entry
getStreamID()
.tap(() => ui.create()) // tap as not to swallow streamID
.then(poll)
.catch((e) => { console.error(e); });
