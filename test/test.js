'use strict';

const path = require('path');
const {TLSSocket} = require('tls');
const {promisify} = require('util');
const request = promisify(require('request').defaults({strictSSL: false}));

const tape = require('tape');
const tapSpec = require('tap-spec');

const express = require('express');
const pem = require('pem');
const createCerts = promisify(pem.createCertificate);
const getPort = require('get-port');

const hh2 = require('../index.js');

const getCerts = async _ => {
  const {serviceKey, certificate} = await createCerts({
    days: 7, // seems like a bare minimum
    selfSigned: true,
  });

  return {
    key: serviceKey,
    cert: certificate,
  };
};

tape.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);


const app = require('express')();
app.use(express.static(path.resolve(__dirname, './public')));

const isOK = (res) => res.statusCode === 200;

const usesSSL = (res) => {
  return (isOK(res) && (res.socket instanceof TLSSocket || res.connection instanceof TLSSocket));
};


tape('http test', async t => {
  t.plan(1);

  const server = hh2(app, {
    type: 'http',
  });

  const port = await getPort();

  server.listen(port, '::', async _ => {
    try {
      const res = await request(`http://localhost:${port}/sample.json`);

      if (isOK(res)) {
        t.pass(`http mode working, status: ${res.statusCode}`);
      } else {
        t.fail(`http mode not working, status: ${res.statusCode}`);
      }
      server.close();
    } catch (e) {
      t.fail(`Failed: ${e}`);
      server.close();
    }
  });
});


tape('https test', async t => {
  t.plan(1);

  const certs = await getCerts();

  const server = hh2(app, {
    type: 'https',
    key: certs.key,
    cert: certs.cert,
  });

  const port = await getPort();

  server.listen(port, '::', async _ => {
    try {
      const res = await request(`https://localhost:${port}/sample.json`, {insecure: true});

      if (usesSSL(res)) {
        t.pass(`https mode working, status: ${res.statusCode}`);
      } else {
        t.fail(`https mode not working, status: ${res.statusCode}`);
      }
      server.close();
    } catch (e) {
      t.fail(`Failed: ${e}`);
      server.close();
    }
  });
});


// @TODO: add http2 test
