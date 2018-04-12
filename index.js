'use strict';

const http = require('http');
const https = require('https');
const http2 = require('http2');

/**
 * @param {function} handler request handler
 * @param {Object} opts options for server
 *
 * @returns {Object}
 */
const createServer = (handler, opts) => {
  if (opts.h2) {
    if (opts.secure) {
      return http2.createSecureServer(opts, handler);
    } else {
      return http2.createServer(handler);
    }
  } else if (opts.secure) {
    return https.createServer(opts, handler);
  }

  return http.createServer(handler);
};


/**
 * Creates and returns an instance of (http.Server|https.Server|http2.Server)
 *
 * @param {function} handler instance of net.Server
 * @param {Object} options options for server
 *
 * @return {Object}
 */
const hh2 = (handler, options = {}) => {
  const opts = Object.assign({}, options);

  opts.secure = !!opts.secure;
  opts.h2 = !!opts.h2;

  if (typeof handler !== 'function') {
    throw new TypeError('\'handler\' is not an instance of net.Server');
  }

  return createServer(handler, opts);
};


module.exports = hh2;
