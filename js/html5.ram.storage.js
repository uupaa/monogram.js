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
    has:        has,        // (ids:String/StringArray, fn:Function = null):Boolean
    get:        get,        // (ids:String/StringArray, fn:Function = null):ObjectArray
    set:        set,        // (values:Array, fn:Function = null):this
    list:       list,       // (fn:Function = null):Array
    fetch:      fetch,      // (fn:Function = null):Object
    clear:      clear,      // (fn:Function = null):this
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

function has(ids,  // @arg String/StringArray:
             fn) { // @arg Function(= null): fn(err:Error, hasAll:Boolean, ids:StringArray)
                   // @ret Boolean: true is has all
                   // @help: RAMStorage#has
    if (typeof ids === "string") {
        ids = [ids];
    }

    var rv = false, i = 0, iz = ids.length;

    for (; i < iz; ++i) {
        if (ids[i] && (this._tableName + ids[i]) in this._db) {
            rv = true;
        } else {
            rv = false;
            break;
        }
    }
    fn && fn(null, rv, ids);
    return rv;
}

function get(ids,  // @arg String/StringArray:
             fn) { // @arg Function(= null): fn(err:Error, result:ObjectArray)
                   // @ret ObjectArray:
                   // @help: RAMStorage#get
    if (typeof ids === "string") {
        ids = [ids];
    }

    var rv = [], result, ary, i = 0, iz = ids.length;

    for (; i < iz; ++i) {
        result = this._db[this._tableName + ids[i]];
        if (result) {
            ary = result.split("\v");
            rv.push({
                id:     ids[i],
                hash:   ary[0],
                time:  +ary[1],
                data:   ary[2]
            });
        }
    }
    fn && fn(null, rv); // fn(null, [{ id, hash, time, data }, ...])
    return rv;
}

function set(values, // @arg Array: [<id, hash, time, data>, <...>, ...]
             fn) {   // @arg Function(= null): fn(err:Error)
                     // @ret this:
                     // @help: RAMStorage#set
    var rv = [], id, i = 0, iz = values.length;

    for (; i < iz; i += 4) {
        id = values[i];
        this._db[this._tableName + id] =
                id + "\v" + values[i + 1] +
                     "\v" + values[i + 2] +
                     "\v" + values[i + 3];
    }
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

function fetch(fn) { // @arg Function(= null): fn(err:Error, result:ObjectArray)
                     // @ret Object: result
                     // @help: RAMStorage#fetch
    var rv = [], key, ary;

    for (key in this._db) {
        if (key.indexOf(this._tableName) === 0) {
            ary = this._db[key].split("\v");
            rv.push({
                id:     ary[0],
                hash:   ary[1],
                time:  +ary[2],
                data:   ary[3]
            });
        }
    }
    fn && fn(null, rv);
    return rv;
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

