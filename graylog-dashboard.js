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
const inquirer = require('inquirer');
const yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .describe('stream-title', 'Graylog Stream Title')
  .describe('server-url', 'Full Graylog REST API URL')
  .describe('poll-interval', 'How often (in ms) to poll the Graylog server')
  .default('poll-interval', 1000)
  .describe('username', 'Graylog username')
  .describe('password', 'Graylog password')
  .describe('cred-file-path', 'Path to an optional credentials file')
  .default('cred-file-path', `${process.env.HOME}/.graylog_dashboard`)
  .help();

// Will contain:
// username, password, host, streamID, pollInterval, credFilePath
let config;

function getOptions() {
  return Promise.try(function getOptionInput() {
    const {argv} = yargs;

    // Read user credentials.
    let fileConfig = {};
    try {
      fileConfig = yaml.safeLoad(fs.readFileSync(argv['cred-file-path'], 'utf8'));
    } catch (err) {
      // Ignore, maybe everything was defined in argv
    }

    // Remove falsy values from argv to clean up merge.
    Object.keys(argv).forEach((k) => {
      if (!argv[k]) delete argv[k];
    });
    // Merge argv & file config.
    config = Object.assign({}, fileConfig, argv);
    config.serverURL = argv['server-url'] || config.serverURL; // casing
  })
  .then(function checkMissingOptions() {
    // Check mandatory config.
    const shouldPrompt = ['username', 'password', 'serverURL'].filter((k) => !config[k]);

    // Prompt user for missing options.
    if (shouldPrompt.length) {
      const questions = shouldPrompt.map((k) => (
        {name: k, message: `Please input ${k}:`, type: k === 'password' ? 'password' : 'input'}
      ));

      // Inquirer uses core `readline`. When activated, it automatically emits `line` and `keypress` events.
      // Built-in NodeJS `readline` uses `stream[Symbol('keypress-decoder')]` to mark this, but blessed
      // uses its own check. If both are running, we'll get double keypress events which makes working
      // the stream list very difficult.
      process.stdin._keypressDecoder = true;

      const prompt = inquirer.createPromptModule();
      return prompt(questions)
      .then(function(result) {
        Object.assign(config, result);
      });
    }
  })
  .then(function coerceOptions() {
    // Make sure we have a protocol (default: https)
    if (config.serverURL.slice(0, 4) !== 'http') config.serverURL = 'https://' + config.serverURL;
    // Make sure we have a port (default REST API port is 12900)
    if (!/:\d+$/.test(config.serverURL)) config.serverURL += ':12900';
    // Make sure config.serverURL has a trailing slash. (computers.)
    if (config.serverURL[config.serverURL.length - 1] !== '/') config.serverURL += '/';
    return config;
  });
}

let streams; // filled in after streams runs
function storeStreams(_streams) {
  streams = _streams;
  if (!config.streamTitle) {
    // Could happen on startup
    config.streamTitle = streams[0].title;
  }
  const thisStream = streams.find((s) => s.title === config.streamTitle);
  config.streamID = thisStream.id;
  ui.flush(thisStream.title, streams);
}

function onStreamChange(blessedEl) {
  const streamTitle = blessedEl.content;
  config.streamTitle = streamTitle;
  config.streamID = streams.find((s) => s.title === streamTitle).id;
  ui.flush(streamTitle, streams);
}

function poll() {
  return Promise.all([
    graylog.lastMessagesOfStream(config).then(handlers.updateMessagesList),
    graylog.streamThroughput(config).then(handlers.updateStreamThroughput),
    graylog.totalThroughput(config).then(handlers.updateTotalThroughputLine),
    graylog.streamAlerts(config).then(handlers.renderAlerts),
  ])
  .then(() => ui.render()) // batch up renders
  .delay(config.pollInterval)
  .then(() => poll(config.streamID));
}

// Entry
getOptions()
.then(() => ui.create({onStreamChange}))
.then(() => graylog.streams(config))
.tap(storeStreams)
.then(handlers.updateStreamsList)
.then(poll)
.catch((e) => { ui.screen && ui.screen.destroy(); console.error(e); process.exit(1); });
