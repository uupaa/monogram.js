// html5.storage.cache.js: Storage Cache

//{@storagecache
(function(global) {

// --- header ----------------------------------------------
function StorageCache() {
}
StorageCache.prototype = {
    constructor:StorageCache,
    setup:      StorageCache_setup, // StorageCache#setup(storage:Instance, fn:Await/Function(= null)):this
    name:       StorageCache_name,  // StorageCache#name():String
    has:        StorageCache_has,   // StorageCache#has(id:String):void
    get:        StorageCache_get,   // StorageCache#get(id:String):Object/null
    set:        StorageCache_set,   // StorageCache#set(id:String, values:Array):this
    list:       StorageCache_list,  // StorageCache#list():this
    fetch:      StorageCache_fetch, // StorageCache#fetch(fn:Function = null):this
    remove:     StorageCache_remove,// StorageCache#remove(id:String, fn:Function = null):this
    clear:      StorageCache_clear, // StorageCache#clear(fn:Function = null):this
    tearDown:   StorageCache_tearDown//StorageCache#tearDown(fn:Await/Function = null):this
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function StorageCache_setup(storage, // @arg Instance: SQLStorage or WebStorage
                            fn) {    // @arg Await/Function(= null): fn(err:Error)
                                     // @ret this:
    var that = this;
    var isAwait = !!(fn && fn.ClassName === "Await");

    this._storage = storage;
    this._cache = {};   // Object: on memory cache data. { id: { hash, time, data }, ... }
    this._queue = [];   // Array: insert queue [ [id, hash, time, data], ...]
    this._timerID = 0;  // Integer: timer id

    storage.fetch(function(err, result) {
        if (err) { throw err; }

        that._cache = result;
        if (fn) {
            isAwait ? fn.miss() : fn( new TypeError("WebStorage NOT_IMPL") );
        }
        //fn(null);
    });
    return this;
}

function StorageCache_name() { // @ret String:
                               // @desc: get storage class name
    return this._storage.constructor.name;
}

function StorageCache_has(id) { // @arg String:
                                // @ret Boolean:
                                // @desc: has id
    return id in this._cache;
}

function StorageCache_get(id) { // @arg String:
                                // @ret Object/null:
    return this._cache[id] || null;
}

function StorageCache_set(id,       // @arg String:
                          values) { // @arg Array: [col2value, col3value, ...]
                                    // @ret this:
                                    // @desc: add/update row
    this._cache[id] = values;
    this._queue.push([id].concat(values));
    _startQueue(this);
    return this;
}

function StorageCache_list() { // @ret Array:
    return Object.keys(this._cache);
}

function StorageCache_fetch(fn) { // @arg Function(= null): fn(err:Error, result:Object)
                                  // @ret this:
    var that = this;

    this._storage.fetch(function(err, result) {
        if (err) { throw err; }

        that._cache = result;
        fn && fn(null, result); // ok
    });
    return this;
}

function StorageCache_remove(id,   // @arg String:
                             fn) { // @arg Function(= null): fn(err:Error)
                                   // @ret this:
    delete this._cache[id];
    this._storage.remove(id, fn);
    return this;
}

function StorageCache_clear(fn) { // @arg Function(= null): fn(err:Error)
                                  // @ret this:
                                  // @desc: clear all data
    _stopQueue(this);
    this._cache = {};
    this._storage.clear(fn);
    return this;
}

function StorageCache_tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                                     // @ret this:
                                     // @desc: drop table
    _stopQueue(this);
    this._cache = {};
    this._storage.tearDown(fn);
    return this;
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

    var values = that._queue.shift();
    var id = values.shift();

    that._storage.set(id, values, function(err) {
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

