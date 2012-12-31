// html5.ram.storage.js: RAMStorage

//{@ramstorage
(function(global) {

// --- header ----------------------------------------------
function RAMStorage() {
}
RAMStorage.prototype = {
    constructor:RAMStorage,
    setup:      RAMStorage_setup,   // RAMStorage#setup(dbName:String, tableName:String, fn:Await/Function = null):void
    has:        RAMStorage_has,     // RAMStorage#has(id:String, fn:Function = null):Boolean
    get:        RAMStorage_get,     // RAMStorage#get(id:String, fn:Function = null):Object
    set:        RAMStorage_set,     // RAMStorage#set(id:String, values:Array, fn:Function = null):this
    list:       RAMStorage_list,    // RAMStorage#list(fn:Function = null):Array
    clear:      RAMStorage_clear,   // RAMStorage#clear(fn:Function = null):this
    fetch:      RAMStorage_fetch,   // RAMStorage#fetch(fn:Function = null):Object
    remove:     RAMStorage_remove,  // RAMStotage#remove(id:String, fn:Function = null):this
    tearDown:   RAMStorage_tearDown // RAMStorage#tearDown(fn:Await/Function = null):this
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function RAMStorage_setup(dbName,    // @arg String: db name
                          tableName, // @arg String: table name
                          fn) {      // @arg Await/Function(= null): fn(err:Error)
                                     // @ret this:
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._db = {};
    this._tableName = tableName;

    fn && ( isAwait ? fn.pass() : fn(null) ); // ok
    return this;
}

function RAMStorage_has(id,   // @arg String:
                        fn) { // @arg Function(= null): fn(err:Error, has:Boolean)
                              // @ret Boolean:
    var rv = (this._tableName + id) in this._db;

    fn && fn(null, rv);
    return rv;
}

function RAMStorage_get(id,   // @arg String:
                        fn) { // @arg Function(= null): fn(err:Error, result:Object)
                              // @ret Object:
    if ((this._tableName + id) in this._db) {
        var rv = {}, ary = this._db[this._tableName + id].split("¥t");

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

function RAMStorage_set(id,     // @arg String:
                        values, // @arg Array: [col2value, col3value, ...]
                        fn) {   // @arg Function(= null): fn(err:Error)
                                // @ret this:
    this._db[this._tableName + id] = values.join("¥t");
    fn && fn(null); // ok
    return this;
}

function RAMStorage_list(fn) { // @arg Function(= null): fn(err:Error, list:Array)
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

function RAMStorage_clear(fn) { // @arg Function(= null): fn(err:Error)
                                // @ret this:
    for (var key in this._db) {
        if (key.indexOf(this._tableName) === 0) {
            delete this._db[key];
        }
    }
    fn && fn(null);
    return this;
}

function RAMStorage_fetch(fn) { // @arg Function(= null): fn(err:Error, result:Object)
                                // @ret Object: result
    var rv = {}, key, ary, id;

    for (key in this._db) {
        if (key.indexOf(this._tableName) === 0) {
            ary = this._db[key].split("¥t");
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

function RAMStorage_remove(id,   // @arg String:
                           fn) { // @arg Function(= null): fn(err:Error)
                                 // @ret this:
    delete this._db[this._tableName + id];
    fn && fn(null);
    return this;
}

function RAMStorage_tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                                   // @ret this:
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._db = {};

    fn && ( isAwait ? fn.pass() : fn(null) ); // ok
    return this;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { RAMStorage: RAMStorage } };
} else {
    global.Monogram || (global.Monogram = {});
    global.Monogram.RAMStorage = RAMStorage;
}

})(this.self || global);
//}@ramstorage

