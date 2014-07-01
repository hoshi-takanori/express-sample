module.exports = function (session) {
  var Store = session.Store;

  function MemoryStore(options) {
    Store.call(this, options || {});
    this.debug = options && options.debug;
    this.sessions = {};
  }

  MemoryStore.prototype.__proto__ = Store.prototype;

  MemoryStore.prototype.get = function (sid, fn) {
    var sess = this.sessions[sid];
    if (this.debug) console.log('MemoryStore.get: sid = ' + sid + ', sess = ' + sess);
    if (sess) {
      sess = JSON.parse(sess);
      setImmediate(fn, null, sess);
    } else {
      setImmediate(fn);
    }
  }

  MemoryStore.prototype.set = function (sid, sess, fn) {
    sess = JSON.stringify(sess);
    if (this.debug) console.log('MemoryStore.set: sid = ' + sid + ', sess = ' + sess);
    this.sessions[sid] = sess;
    fn && setImmediate(fn);
  }

  MemoryStore.prototype.destroy = function (sid, fn) {
    if (this.debug) console.log('MemoryStore.destroy: sid = ' + sid);
    delete this.sessions[sid];
    fn && setImmediate(fn);
  }

  return MemoryStore;
};
