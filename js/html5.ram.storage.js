// html5.ram.storage.js: On Memory Storage

//{@ramstorage
(function(global) {

// --- header ----------------------------------------------
function RAMStorage() {
}
RAMStorage.name = "RAMStorage"; // fn.constructor.name -> "RAMStorage"
RAMStorage.prototype = {
    constructor:RAMStorage,
    setup:      setup,      // (dbName:String, tableName:String, fn:Await/Function = null):void
    has:        has,        // (id:String, fn:Function = null):Boolean
    get:        get,        // (id:String, fn:Function = null):Object
    set:        set,        // (id:String, values:Array, fn:Function = null):this
    list:       list,       // (fn:Function = null):Array
    clear:      clear,      // (fn:Function = null):this
    fetch:      fetch,      // (fn:Function = null):Object
    remove:     remove,     // (id:String, fn:Function = null):this
    tearDown:   tearDown    // (fn:Await/Function = null):this
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function setup(dbName,    // @arg String: db name
               tableName, // @arg String: table name
               fn) {      // @arg Await/Function(= null): fn(err:Error)
                          // @ret this:
                          // @help: RAMStorage#setup
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._db = {};
    this._tableName = tableName;

    fn && ( isAwait ? fn.pass() : fn(null) ); // ok
    return this;
}

function has(id,   // @arg String:
             fn) { // @arg Function(= null): fn(err:Error, has:Boolean)
                   // @ret Boolean:
                   // @help: RAMStorage#has
    var rv = (this._tableName + id) in this._db;

    fn && fn(null, rv);
    return rv;
}

function get(id,   // @arg String:
             fn) { // @arg Function(= null): fn(err:Error, result:Object)
                   // @ret Object:
                   // @help: RAMStorage#get
    if ((this._tableName + id) in this._db) {
        var rv = {}, ary = this._db[this._tableName + id].split("\v");

        rv["id"]   =  id;
        rv["hash"] =  ary[0];
        rv["time"] = +ary[1];
        rv["data"] =  ary[2];
        fn && fn(null, rv); // fn(null, { id, hash, time, data })
        return rv;
    }
    fn && fn(null, null); // not found
    return null;
}

function set(id,     // @arg String:
             values, // @arg Array: [col2value, col3value, ...]
             fn) {   // @arg Function(= null): fn(err:Error)
                     // @ret this:
                     // @help: RAMStorage#set
    this._db[this._tableName + id] = values.join("\v");
    fn && fn(null); // ok
    return this;
}

function list(fn) { // @arg Function(= null): fn(err:Error, list:Array)
                    // @help: RAMStorage#list
    var list = [], key, id;

    for (key in this._db) {
        if (key.indexOf(this._tableName) === 0) {
            id = key.split(this._tableName)[1];
            list.push( id );
        }
    }
    fn && fn(null, list);
    return list;
}

function clear(fn) { // @arg Function(= null): fn(err:Error)
                     // @ret this:
                     // @help: RAMStorage#clear
    for (var key in this._db) {
        if (key.indexOf(this._tableName) === 0) {
            delete this._db[key];
        }
    }
    fn && fn(null);
    return this;
}

function fetch(fn) { // @arg Function(= null): fn(err:Error, result:Object)
                     // @ret Object: result
                     // @help: RAMStorage#fetch
    var rv = {}, key, ary, id;

    for (key in this._db) {
        if (key.indexOf(this._tableName) === 0) {
            ary = this._db[key].split("\v");
            id = key.split(this._tableName)[1];
            rv[id] = {
                id:     id,
                hash:   ary[0],
                time:  +ary[1],
                data:   ary[2]
            };
        }
    }
    fn && fn(null, rv);
    return rv;
}

function remove(id,   // @arg String:
                fn) { // @arg Function(= null): fn(err:Error)
                      // @ret this:
                      // @help: RAMStorage#remove
    delete this._db[this._tableName + id];
    fn && fn(null);
    return this;
}

function tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                        // @ret this:
                        // @help: RAMStorage#tearDown
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._db = {};

    fn && ( isAwait ? fn.pass() : fn(null) ); // ok
    return this;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { RAMStorage: RAMStorage };
}
global.Monogram || (global.Monogram = {});
global.Monogram.RAMStorage = RAMStorage;

})(this.self || global);
//}@ramstorage

