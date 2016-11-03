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
const request = require('request');
Promise.promisifyAll(request);

module.exports = {

  streamAlerts(options) {
    const url = `${options.serverURL}streams/${options.streamID}/alerts/check`;

    return request.getAsync({uri: url, json: true, auth: makeAuth(options)})
    .then((response) => {
      return response.body;
    })
    .catch((error) => {
      throw new Error('Could not get stream alerts. Error:' + error.message);
    });
  },

  lastMessagesOfStream(options) {
    const url = `${options.serverURL}search/universal/relative`;
    const parameters = {
      query: "*",
      range: 86400,
      fields: "timestamp,message",
      filter: "streams:" + options.streamID,
      limit: 50
    };

    return request.getAsync({uri: url, json: true, qs: parameters, auth: makeAuth(options)})
    .then((response) => {
      return response.body.messages.map((m) => m.message);
    })
    .catch((error) => {
      throw new Error('Could not get stream messages. ' + error.message);
    });
  },

  streams(options) {
    const url = `${options.serverURL}streams`;

    return request.getAsync({uri: url, json: true, auth: makeAuth(options)})
    .then((response) => {
      return response.body.streams
      .sort((a, b) => a.title.localeCompare(b.title));
    })
    .catch((error) => {
      throw new Error('Could not get stream throughput. ' + error.stack);
    });
  },

  streamThroughput(options) {
    const url = `${options.serverURL}system/metrics/org.graylog2.plugin.streams.Stream.${options.streamID}.incomingMessages.1-sec-rate`;

    return request.getAsync({uri: url, json: true, auth: makeAuth(options)})
    .then((response) => {
      return response.body.value;
    })
    .catch((error) => {
      throw new Error('Could not get stream throughput. ' + error.message);
    });
  },

  totalThroughput(options) {
    const url = `${options.serverURL}system/throughput`;

    return request.getAsync({uri: url, json: true, auth: makeAuth(options)})
    .then((response) => {
      return response.body.throughput;
    })
    .catch((error) => {
      throw new Error('Could not get stream total throughput. ' + error.message);
    });
  }

};

// TODO API Token?
function makeAuth(options) {
  return {user: options.username, pass: options.password, sendImmediately: true};
}
