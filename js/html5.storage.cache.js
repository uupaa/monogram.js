// html5.storage.cache.js: Storage Cache

//{@storagecache
(function(global) {

// --- header ----------------------------------------------
function StorageCache() {
}
StorageCache.name = "StorageCache"; // fn.constructor.name -> "StorageCache"
StorageCache.prototype = {
    constructor:StorageCache,
    setup:      setup,      // (storage:Instance, fn:Await/Function(= null)):this
    name:       name,       // ():String
    has:        has,        // (id:String):void
    get:        get,        // (id:String):Object/null
    set:        set,        // (id:String, values:Array):this
    list:       list,       // ():Array
    clear:      clear,      // (fn:Function = null):this
    fetch:      fetch,      // (fn:Function = null):this
    remove:     remove,     // (id:String, fn:Function = null):this
    tearDown:   tearDown    // (fn:Await/Function = null):this
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function setup(storage, // @arg Instance: SQLStorage / WebStorage / RAMStorage
               fn) {    // @arg Await/Function(= null): fn(err:Error)
                        // @ret this:
                        // @help: StorageCache#setup
    var that = this;
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._storage = storage;
    this._cache = {};   // Object: on memory cache data. { id: { ... }, ... }
    this._queue = [];   // Array: insert queue [ values, ...]
    this._timerID = 0;  // Integer: timer id

    storage.fetch(function(err, result) {
        if (err) { throw err; }

        that._cache = result;
        if (fn) {
            isAwait ? fn.pass()
                    : fn(null); // ok
        }
    });
    return this;
}

function name() { // @ret String:
                  // @help: StorageCache#name
                  // @desc: get storage class name
    return this._storage.constructor.name;
}

function has(id) { // @arg String:
                   // @ret Boolean:
                   // @help: StorageCache#has
                   // @desc: has id
    return id in this._cache;
}

function get(id) { // @arg String:
                   // @ret Object/null:
                   // @help: StorageCache#get
    return this._cache[id] || null;
}

function set(id,       // @arg String:
             values) { // @arg Array: [col2value, col3value, ...]
                       // @ret this:
                       // @help: StorageCache#set
                       // @desc: add/update row
    this._cache[id] = values;
    this._queue.push([id].concat(values));
    _startQueue(this);
    return this;
}

function list() { // @ret Array:
                  // @help: StorageCache#list
    return Object.keys(this._cache);
}

function fetch(fn) { // @arg Function(= null): fn(err:Error, result:Object)
                     // @ret this:
                     // @help: StorageCache#fetch
    var that = this;

    this._storage.fetch(function(err, result) {
        if (err) { throw err; }

        that._cache = result;
        fn && fn(null, result); // ok
    });
    return this;
}

function remove(id,   // @arg String:
                fn) { // @arg Function(= null): fn(err:Error)
                      // @ret this:
                      // @help: StorageCache#remove
    delete this._cache[id];
    this._storage.remove(id, fn);
    return this;
}

function clear(fn) { // @arg Function(= null): fn(err:Error)
                     // @ret this:
                     // @help: StorageCache#clear
                     // @desc: clear all data
    _stopQueue(this);
    this._cache = {};
    this._storage.clear(fn);
    return this;
}

function tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                        // @ret this:
                        // @help: StorageCache#tearDown
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

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { StorageCache: StorageCache };
}
global.Monogram || (global.Monogram = {});
global.Monogram.StorageCache = StorageCache;

})(this.self || global);
//}@storagecache

