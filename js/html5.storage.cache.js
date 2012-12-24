// html5.storage.cache.js: Storage Cache

//{@storagecache
(function(global) {

// --- header ----------------------------------------------
function StorageCache(storage, // @arg Instance: SQLStorage or WebStorage
                      fn) {    // @arg Function(= null): fn(err:Error, that:this)
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "StorageCache" });

    this._init(storage, fn);
}

StorageCache.prototype = {
    _init:  StorageCache_init,
    has:    StorageCache_has,     // StorageCache#has(id:String):void
    get:    StorageCache_get,     // StorageCache#get(id:String):String
    getTime:StorageCache_getTime, // StorageCache#getTime(id:String):Integer
    set:    StorageCache_set,     // StorageCache#set(id:String, data:String, time:Integer):void
    clear:  StorageCache_clear,   // StorageCache#clear(fn:Function = null):void
    tearDown:StorageCache_tearDown// StorageCache#tearDown(fn:Function = null):void
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function StorageCache_init(storage, fn) {
    var that = this;

    this._storage = storage;
    this._cache = {};   // Object: on memory cache data. { key: data, ... }
    this._times = {};   // Object: on memory cache data. { key: time, ... }
    this._queue = [];   // Array: insert queue [<id, data, time>, ...]
    this._timerID = 0;  // Integer: timer id

    storage.fetch(function(err, result, times) {
        if (err) { throw err; }

        that._cache = result;
        that._times = times;
        fn(null, that);
    });
}

function StorageCache_has(id) { // @arg String:
                                // @ret Boolean:
                                // @desc: has id
    return id in this._cache;
}

function StorageCache_fetch(id,   // @arg String:
                            fn) { // @arg Function: fn(err:Error, result:Object, times:Object)
    var that = this;

    this._storage.fetch(function(err, result, times) {
        if (err) { throw err; }

        that._cache = result;
        that._times = times;
        fn(null, result, times); // ok
    });
}

function StorageCache_get(id) { // @arg String:
                                // @ret String:
    return this._cache[id] || "";
}

function StorageCache_getTime(id) { // @arg String:
                                    // @ret Integer:
    return this._times[id] || "";
}

function StorageCache_set(id,     // @arg String:
                          data,   // @arg String: "" is delete row.
                          time) { // @arg Integer(= 0):
                                  // @desc: add/update row
    if (data) {
        this._cache[id] = data;
        this._times[id] = time;
    } else {
        delete this._cache[id];
        delete this._times[id];
    }
    this._queue.push(id, data, time || 0);
    _startQueue(this);
}

function StorageCache_clear(fn) { // @arg Function(= null): fn(err:Error)
                                  // @desc: clear all data
    _stopQueue(this);
    this._cache = {};
    this._times = {};
    this._storage.clear(fn);
}

function StorageCache_tearDown(fn) { // @arg Function(= null): fn(err:Error)
                                     // @desc: drop table
    _stopQueue(this);
    this._cache = {};
    this._times = {};
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
    var time = that._queue.shift();

    that._storage.set(id, data, time, function(err) {
        if (err) { throw err; }
        // console.log(err.message);
        // that._queue.push(id, data);
    });
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { StorageCache: StorageCache } };
} else {
    global.Monogram || (global.Monogram = {});
    global.Monogram.StorageCache = StorageCache;
}

})(this.self || global);
//}@storagecache

/*
    var SQLStorage   = reuqire("./html5.sql.storage").Monogram.SQLStorage;
    var StorageCache = reuqire("./html5.storage.cache").Monogram.StorageCache;

    var storage = new SQLStorage("mydb", "mytable", function(err, storage) {
    });

    function test1() {
        new StorageCache(storage, function(err, cache) {
            cache.set("id", "base64data");
            cache.has("id"); // true

            node.src = "data:image/png;base64" + cache.get("id");

            cache.clear();
        });
    }
 */

