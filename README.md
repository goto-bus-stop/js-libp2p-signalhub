# libp2p-signalhub

[![](https://raw.githubusercontent.com/libp2p/interface-peer-discovery/master/img/badge.png)](https://github.com/libp2p/interface-peer-discovery)

peer discovery for libp2p using signalhubs

[Install](#install) - [Usage](#usage) - [License: Apache-2.0](#license)

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/libp2p-signalhub.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/libp2p-signalhub
[travis-image]: https://img.shields.io/travis/goto-bus-stop/libp2p-signalhub.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/libp2p-signalhub
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install libp2p-signalhub
```

## Usage

```js
var Signalhub = require('libp2p-signalhub')

new Libp2p({
  modules: {
    peerDiscovery: [Signalhub]
  },
  config: {
    peerDiscovery: {
      signalhub: {
        appName: 'your-app-name',
        hubs: ['https://signalhub.myapp.org']
      }
    }
  }
})
```

## API

### `node = new Signalhub(opts)`

Create a new peer discover node.

- `opts.appName` - required, name of your application, so different apps on one signalhub don't interfere
- `opts.channel` - channel name for broadcasts, default 'libp2p-discover'
- `opts.peerInfo` - [PeerInfo](https://npmjs.com/package/peer-info) instance, normally passed in by libp2p itself
- `opts.broadcast` - whether to broadcast the local multiaddresses to the signalhub, allowing other nodes to find you, default `false`
- `opts.interval` - broadcast interval in ms, default 10 seconds
- `opts.hubs` - array of signalhub HTTP URLs to subscribe/broadcast to

### `node.start(cb)`

Start listening for other peers (and broadcasting if `opts.broadcast`).

`cb` is called with an error if the subscription could not be started.

### `node.stop(cb)`

Stop listening and broadcasting.

### `node.on('peer', function(peerInfo))`

Event emitted when a new peer is discovered. `peerInfo` is a [PeerInfo](https://npmjs.com/package/peer-info) instance.

## License

[Apache-2.0](LICENSE.md)
