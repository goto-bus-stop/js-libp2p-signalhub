var EventEmitter = require('events')
var inherits = require('inherits')
var PeerId = require('peer-id')
var PeerInfo = require('peer-info')
var Multiaddr = require('multiaddr')
var signalhub = require('signalhub')
var ms = require('ms')

SignalhubDiscovery.tag = 'signalhub'

function SignalhubDiscovery (options) {
  if (!(this instanceof SignalhubDiscovery)) return new SignalhubDiscovery(options)

  EventEmitter.call(this)

  this._hub = signalhub(options.appName, options.hubs)
  this._channel = options.channel || 'libp2p-discover'
  this._info = options.peerInfo
  this._broadcast = options.broadcast !== false
  this._interval = options.interval || ms('10 seconds')
}

inherits(SignalhubDiscovery, EventEmitter)

SignalhubDiscovery.prototype._stringId = function () {
  return this._info.id.toB58String()
}

SignalhubDiscovery.prototype.start = function (callback) {
  var self = this

  this._subscription = this._hub.subscribe(this._channel)
    .once('error', callback)
    .once('open', function () { callback(null) })
    .on('data', function (str) {
      var message
      try { message = JSON.parse(str) } catch (err) { return }
      // ignore myself
      if (!message.id || message.id === self._stringId()) return
      if (!Array.isArray(message.ma)) return

      var id = PeerId.createFromB58String(message.id)
      PeerInfo.create(id, function (err, peerInfo) {
        if (err) return
        message.ma.forEach(function (addr) {
          peerInfo.multiaddrs.add(new Multiaddr(addr))
        })
        self.emit('peer', peerInfo)
      })
    })

  if (this._broadcast) {
    process.nextTick(broadcast)
    this._broadcaster = setInterval(broadcast, this._interval)
  }

  function broadcast () {
    var addrs = self._info.multiaddrs.toArray().map(function (addr) {
      return addr.toString()
    })
    self._hub.broadcast(self._channel, JSON.stringify({ id: self._stringId(), ma: addrs }))
  }
}

SignalhubDiscovery.prototype.stop = function (callback) {
  if (this._broadcaster) {
    clearInterval(this._broadcaster)
    this._broadcaster = null
  }
  this._subscription.once('close', function () {
    callback(null)
  })
  this._subscription.destroy()
  this._subscription = null
}

module.exports = SignalhubDiscovery
