'use strict';

const createMenu = require('@timothygu/terminal-menu');
const api = require('./graylog-api');
const Promise = require('bluebird');

module.exports = function makeMenu(options) {
  return api.streams(options)
  .then((streams) => {
    const menu = createMenu({ width: 120, x: 4, y: 2, fg: 'black' });
    menu.reset();
    menu.write('CHOOSE A GRAYLOG STREAM\n');
    menu.write('-----------------------\n');

    // Add items.
    streams
    .sort((s1, s2) => s1.title.localeCompare(s2.title))
    .forEach((s) => {
      menu.add(s.title);
    });
    menu.write('\n');
    menu.add('EXIT');

    // Bind input.
    process.stdin.pipe(menu.createStream()).pipe(process.stdout);
    process.stdin.setRawMode(true);
    menu.on('close', function () {
      process.stdin.setRawMode(false);
      process.stdin.end();
    });

    // When the user selects an option, resolve a promise with the label of that option.
    return Promise.fromNode((callback) => {
      menu.on('select', (label) => callback(null, label));
    })
    .then((label) => {
      menu.close();
      if (label === 'EXIT') {
        console.log('No stream selected; exiting.');
        return process.exit(0);
      }
      // Find the stream matching this title. We could potentially have an issue if two streams
      // have the same title.
      const thisStream = streams.find((s) => s.title === label);
      if (!thisStream) return makeMenu(options); // try again
      return thisStream.id;
    });
  });
};
