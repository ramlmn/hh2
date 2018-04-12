'use strict';

const http2 = require('http2');
const {TLSSocket} = require('tls');
const {promisify} = require('util');
const request = promisify(require('request').defaults({strictSSL: false}));

const tape = require('tape');
const tapSpec = require('tap-spec');

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

const {
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_PATH,
} = http2.constants;

tape.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);


const app = (req, res) => {
  res.end('OK, go');
};

const isOK = res => res.statusCode === 200;

const usesSSL = res => {
  return (isOK(res) && (res.socket instanceof TLSSocket || res.connection instanceof TLSSocket));
};


tape('http test', async t => {
  t.plan(1);

  const server = hh2(app);

  const port = await getPort();

  server.listen(port, '::', async _ => {
    try {
      const res = await request(`http://localhost:${port}`);

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
    secure: true,
    key: certs.key,
    cert: certs.cert,
  });

  const port = await getPort();

  server.listen(port, '::', async _ => {
    try {
      const res = await request(`https://localhost:${port}`, {insecure: true});

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


tape('http2 test', async t => {
  t.plan(1);

  const certs = await getCerts();

  const server = hh2(app, {
    h2: true,
    secure: true,
    key: certs.key,
    cert: certs.cert,
  });

  const port = await getPort();

  server.listen(port, '::', async _ => {
    const client = http2.connect(`https://localhost:${port}`, {
      ca: [certs.cert],
    });

    client.on('error', e => t.fail('Failed: ', e));
    client.on('close', _ => false);

    const req = client.request({[HTTP2_HEADER_PATH]: '/'});

    req.setEncoding('utf8');

    req.on('response', headers => {
      let data = '';
      req.on('data', chunk => data += chunk);

      req.on('end', async _ => {
        const statusCode = headers[HTTP2_HEADER_STATUS];
        if (statusCode && statusCode === 200) {
          t.pass(`http2 over TLS ok, status: ${statusCode}`);
        } else {
          t.fail(`http2 over TLS not ok, status: ${statusCode}`);
        }
        client.close();
        server.close();
      });
    });
  });
});
