# hh2

[![Greenkeeper badge](https://badges.greenkeeper.io/ramlmn/hh2.svg)](https://greenkeeper.io/)

A zero-dependency wrapper to create various instances of node http interfaces.

## Usage

``` js
const options = {
  h2: Boolean
  secure: Boolean,
  ..., // other options for the server
};

const server = hh2(app, options);
```

The `app` is a `requestListener` for
[node http request](https://nodejs.org/api/http.html#http_event_request).

The `h2` options is used to create `http2` server and the secure option is to
create a `secureServer` variant of `http` or `http2`. By default a `http` server
is created.

Simply put, `hh2` creates the appropriate server and returns an instance of
[net.Server](https://nodejs.org/api/net.html#net_class_net_server).

### https server
``` js
const express = require('express');
const hh2 = require('@ramlmn/hh2');
const app = express();

const server = hh2(app, {
  secure: true,           // <- explicit https

  // certs as options
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
});

server.listen( _ => {
  console.log('> Server started');
});
```

### http2 server
``` js
const express = require('express');
const hh2 = require('@ramlmn/hh2');
const app = express();

const server = hh2(app, {
  h2: true                // <- explicit http2
  secure: true,

  // http2 in SSL
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
});

server.listen(_ => {
  console.log('> Server started');
});
```

## License
[MIT](LICENSE)
