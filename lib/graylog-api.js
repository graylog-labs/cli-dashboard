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

let GRAYLOG_META = null;

module.exports = {

  streamAlerts(options) {
    const url = `${options.serverURL}streams/${options.streamID}/alerts/check`;

    return makeRequest({uri: url, json: true, auth: makeAuth(options)})
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
      sort: 'timestamp:asc',
      limit: 50
    };

    // In 2.3 / ElasticSearch > 5.5 this was changed to `stored_fields`
    // https://github.com/Graylog2/graylog2-server/issues/4042
    if (parseFloat(GRAYLOG_META.version) >= 2.3) {
      parameters.stored_fields = parameters.fields;
      delete parameters.fields;
    }

    return makeRequest({uri: url, json: true, qs: parameters, auth: makeAuth(options)})
    .then((response) => {
      return response.body.messages.map((m) => m.message);
    })
    .catch((error) => {
      throw new Error('Could not get stream messages. ' + error.message + '\n' + JSON.stringify(parameters));
    });
  },

  streams(options) {
    const url = `${options.serverURL}streams`;

    return makeRequest({uri: url, json: true, auth: makeAuth(options)})
    .then((response) => {
      return response.body.streams
      .sort((a, b) => a.title.localeCompare(b.title));
    })
    .catch((error) => {
      throw new Error('Could not get streams. ' + error.message);
    });
  },

  streamThroughput(options) {
    const url = `${options.serverURL}system/metrics/org.graylog2.plugin.streams.Stream.${options.streamID}.incomingMessages.1-sec-rate`;

    return makeRequest({uri: url, json: true, auth: makeAuth(options)})
    .then((response) => {
      return response.body.value;
    })
    .catch((error) => {
      throw new Error('Could not get stream throughput. ' + error.message);
    });
  },

  totalThroughput(options) {
    const url = `${options.serverURL}system/throughput`;

    return makeRequest({uri: url, json: true, auth: makeAuth(options)})
    .then((response) => {
      return response.body.throughput;
    })
    .catch((error) => {
      throw new Error('Could not get stream total throughput. ' + error.message);
    });
  },

  getMetadata(options) {
    const url = `${options.serverURL}system`;
    return makeRequest({uri: url, json: true, auth: makeAuth(options)})
    .then((response) => {
      GRAYLOG_META = response.body;
      return response.body;
    })
    .catch((error) => {
      throw new Error('Could not get Graylog version. ' + error.message);
    });
  }
};

function makeRequest(options) {
  return request.getAsync(options)
  .then((response) => {
    if (response.statusCode < 200 || response.statusCode >= 400) {
      throw new Error(`Bad status code: ${response.statusCode} ${response.statusMessage} ${JSON.stringify(response.body || '')}`);
    }
    return response;
  });
}

// TODO API Token?
function makeAuth(options) {
  return {user: options.username, pass: options.password, sendImmediately: true};
}
