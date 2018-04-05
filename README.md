# hh2

A wrapper to create instances of node http, https and http2 servers.

## Usage

``` js
const options = {
  type: String,
  secure: Boolean,
};

const server = hh2(app, options);
```

The app is a function to handle the `request` event of
[net.Server](https://nodejs.org/api/net.html#net_class_net_server). It can any
function like an instance of [express](https://github.com/expressjs/express).

The `type` inside options takes values like `http` or `https` or `http2`. The
secure option is to create a `secureServer`.

hh2 creates the appropriate server and returns an instance of
[net.Server](https://nodejs.org/api/net.html#net_class_net_server).

### https server
``` js
const express = require('express');
const hh2 = require('@ramlmn/hh2');
const app = express();

const server = hh2(app, {
  type: 'https',

  // https enables secure
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
  type: 'http2',
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
