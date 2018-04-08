'use strict';

const http = require('http');
const https = require('https');
const http2 = require('http2');

/**
 *
 * @param {function} handler request handler
 * @param {Object} opts options for server
 *
 * @returns {Object}
 */
const createServer = (handler, opts) => {
  let server = null;

  if (opts.secure) {
    if (opts.type === 'http2') {
      server = http2.createSecureServer(opts, handler);
    } else {
      server = https.createServer(opts, handler);
    }
  } else {
    if (opts.type === 'http2') {
      server = http2.createServer(handler);
    } else {
      server = http.createServer(handler);
    }
  }

  return server;
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
  const types = ['http', 'https', 'http2'];

  opts.secure = !!opts.secure;

  if (typeof handler !== 'function') {
    throw new TypeError('\'handler\' is not an instance of net.Server');
  }

  if (typeof opts.type !== 'string') {
    throw new TypeError('\'opts.type\' is not of type string');
  }

  opts.type = opts.type.toLowerCase();
  if (!types.includes(opts.type)) {
    throw new Error('\'opts.type\' can be only \'http\' or \'https\' or \'http2\'');
  }

  if (opts.secure && opts.type === 'http') {
    opts.type = 'https';
  } else if (opts.type === 'https' && opts.secure === false) {
    opts.secure = true;
  }

  return createServer(handler, opts);
};


module.exports = hh2;
