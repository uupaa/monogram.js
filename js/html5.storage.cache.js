// html5.storage.cache.js: Storage Cache

/*
    var SQLStorage   = reuqire("html5.sql.storage").SQLStorage;
    var StorageCache = reuqire("html5.storage.cache").StorageCache;

    var storage = new SQLStorage("mydb", "mytable", function(err, that) {
    });

    new StorageCache(storage, function(err, cache) {
        cache.set("id", "base64data");
        cache.has("id"); // true

        node.src = "data:image/png;base64" + cache.get("id");

        cache.clear();
    });
 */

//{@storagecache
(function(global) {

// --- header ----------------------------------------------
function StorageCache(storage, // @arg Instance: SQLStorage or WebStorage
                      fn) {    // @arg Function(= null): fn(err:Error, that:this)
    this.init(storage, fn);
}

StorageCache.prototype = {
    init:   StorageCache_init,    // StorageCache#init(storage:Instance, fn:Function)
    has:    StorageCache_has,     // StorageCache#has(id:String):void
    get:    StorageCache_get,     // StorageCache#get(id:String):void
    set:    StorageCache_set,     // StorageCache#set(id:String, data:String):void
    clear:  StorageCache_clear,   // StorageCache#clear(fn:Function = null):void
    tearDown:StorageCache_tearDown// StorageCache#tearDown(fn:Function = null):void
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function StorageCache_init(storage, // @arg Instance: SQLStorage or WebStorage
                           fn) {    // @arg Function(= null): fn(err:Error, that:this)
    var that = this;

    this._storage = storage;
    this._cache = {};   // Object: on memory cache data. { key: value }
    this._queue = [];   // Array: insert queue [<id, data>, ...]
    this._timerID = 0;  // Integer: timer id

    storage.fetch(function(err, result) {
        if (err) { throw err; }

        that._cache = result;
        fn(null, that);
    });
}

function StorageCache_has(id) { // @arg String:
                                // @ret Boolean:
                                // @desc: has id
    return id in this._cache;
}

function StorageCache_fetch(id,   // @arg String:
                            fn) { // @arg Function: fn(err:Error, result:Object)
    var that = this;

    this._storage.fetch(function(err, result) {
        if (err) { throw err; }

        that._cache = result;
        fn(null, result); // ok
    });
}

function StorageCache_get(id) { // @arg String:
                                // @ret String:
                                // @desc: fetch a row
    return this._cache[id] || "";
}

function StorageCache_set(id,     // @arg String:
                          data) { // @arg String: "" is delete row.
                                  // @desc: add/update row
    var that = this;

    if (data) {
        this._cache[id] = data;
    } else {
        delete this._cache[id];
    }
    this._queue.push(id, data);
    _startQueue(this);
}

function StorageCache_clear(fn) { // @arg Function(= null): fn(err:Error)
                                  // @desc: clear all data
    _stopQueue(this);
    this._cache = {};
    this._storage.clear(fn);
}

function StorageCache_tearDown(fn) { // @arg Function(= null): fn(err:Error)
                                     // @desc: drop table
    _stopQueue(this);
    this._cache = {};
    this._storage.tearDown();
}

function _startQueue(that) {
    if (!that._timerID) {
        that._timerID = setInterval(function() {
            _tick(that);
        }, 100);
    }
}

function _stopQueue(that) {
    if (that._timerID) {
        clearTimeout(that._timerID);
        that._timerID = 0;
    }
}

function _tick(that) {
    if (!that._queue.length) {
        return _stopQueue(that);
    }

    var id   = that._queue.shift();
    var data = that._queue.shift();

    that._storage.set(id, data, function(err) {
        if (err) { throw err; }
        // console.log(err.message);
        // that._queue.push(id, data);
    });
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { StorageCache: StorageCache };
} else {
    global.StorageCache = StorageCache;
}

})(this.self || global);
//}@storagecache

