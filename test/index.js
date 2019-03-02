var test = require('tape')
var sigserver = require('signalhub/server')
var Signalhub = require('..')
var PeerInfo = require('peer-info')
var multiaddr = require('multiaddr')

var hub
var peers = []
test('before all', function (t) {
  t.plan(4)
  hub = sigserver().listen(function (err) {
    t.ifError(err)
  })
  PeerInfo.create((err, peer) => {
    t.ifError(err)
    peer.multiaddrs.add(multiaddr('/ip4/127.0.0.1/tcp/0'))
    peers.push(peer)
  })
  PeerInfo.create((err, peer) => {
    t.ifError(err)
    peer.multiaddrs.add(multiaddr('/ip4/127.0.0.1/tcp/0'))
    peers.push(peer)
  })
  PeerInfo.create((err, peer) => {
    t.ifError(err)
    peer.multiaddrs.add(multiaddr('/ip4/127.0.0.1/tcp/0'))
    peers.push(peer)
  })
})

test('find peers', function (t) {
  t.plan(4)
  t.on('end', function () {
    a.stop(function () {})
    b.stop(function () {})
  })

  var a = new Signalhub({
    appName: 'js-libp2p-signalhub-test',
    peerInfo: peers[0],
    broadcast: true,
    hubs: ['http://127.0.0.1:' + hub.address().port]
  })
  var b = new Signalhub({
    appName: 'js-libp2p-signalhub-test',
    peerInfo: peers[1],
    broadcast: true,
    hubs: ['http://127.0.0.1:' + hub.address().port]
  })

  a.once('peer', function (info) {
    t.strictEqual(peers[1].id.toB58String(), info.id.toB58String())
  })
  b.once('peer', function (info) {
    t.strictEqual(peers[0].id.toB58String(), info.id.toB58String())
  })
  a.start(function (err) { t.ifError(err) })
  b.start(function (err) { t.ifError(err) })
})

test('after all', function (t) {
  hub.close(function (err) {
    t.ifError(err)
    t.end()
  })
})
