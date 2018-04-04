# hh2

A wrapper to create instances of node http, https and http2 servers.

## Usage

``` js
const server = hh2(app, options);
```

The app is a function to handle the `request` event of
[net.Server](https://nodejs.org/api/net.html#net_class_net_server). It can any
function like an instance of [express](https://github.com/expressjs/express).

The `options` object requires `type`, it can take values like `http` or `https`
or `http2`. It creates the appropriate server and returns an instance of
[net.Server](https://nodejs.org/api/net.html#net_class_net_server).

### https server
``` js
const express = require('express');
const hh2 = require('@ramlmn/hh2');

const server = hh2(app, {
  type: 'https',
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

const server = hh2(app, {
  type: 'http2',

  // https requires certificates
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
});

server.listen(_ => {
  console.log('> Server started');
});
```

## License
[MIT](LICENSE)
