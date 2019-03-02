'use strict'

var Libp2p = require('libp2p')
var WS = require('libp2p-websockets')
var PeerInfo = require('peer-info')
var pull = require('pull-stream')
var Signalhub = require('./')

var node
PeerInfo.create(onpeerinfo)

function onpeerinfo (err, peerInfo) {
  if (err) throw err

  // set up server
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')

  var options = {
    peerInfo: peerInfo,

    modules: {
      transport: [WS],
      peerDiscovery: [Signalhub]
    },
    config: {
      peerDiscovery: {
        signalhub: {
          appName: 'libp2p-signalhub-example',
          interval: 2000,
          hubs: [
            'http://localhost:8011/',
            'https://signalhub-jccqtwhdwc.now.sh/',
            'https://signalhub-hzbibrznqa.now.sh/'
          ]
        }
      }
    }
  }
  node = new Libp2p(options)

  node.handle('/example/0.0.0', function (protocol, conn) {
    console.log('handle connection')
    pull(conn, pull.log())
  })

  node.start(onstart)
}

function onstart (err) {
  if (err) throw err
  console.log('started on:')
  node.peerInfo.multiaddrs.forEach(function (ma) {
    console.log('*', ma.toString())
  })

  node.on('peer:discovery', (peer) => {
    node.dialProtocol(peer, '/example/0.0.0', function (err, conn) {
      if (err) throw err
      console.log('dialed', peer.id.toB58String())
      pull(pull.values(['hello', 'world']), conn)
    })
  })

  node.on('peer:connect', (peer) => {
    console.log('Connection established to:', peer.id.toB58String())
  })
  node.on('peer:disconnect', (peer) => {
    console.log('Connection lost to:', peer.id.toB58String())
  })
}
