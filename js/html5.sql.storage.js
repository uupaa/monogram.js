// html5.sql.storage.js: WebSQL Storage

//{@sqlstorage
(function(global) {

// --- header ----------------------------------------------
function SQLStorage() {
}
SQLStorage.name = "SQLStorage"; // fn.constructor.name -> "SQLStorage"
SQLStorage.prototype = {
    constructor:SQLStorage,
    DDL:        DDL,        // ():Object - { SETUP, TEAR_DOWN }
    DML:        DML,        // ():Object - { HAS, GET, SET, REMOVE, FETCH, CLEAR }
    setup:      setup,      // (dbName:String, tableName:String, fn:Await/Function = null):this
    has:        has,        // (id:String, fn:Function):this
    get:        get,        // (id:String, fn:Function):this
    set:        set,        // (id:String, values:Array, fn:Function = null):this
    list:       list,       // (fn:Function):this
    fetch:      fetch,      // (id:String, fn:Function):this
    clear:      clear,      // (fn:Function = null):this
    remove:     remove,     // (id:String, fn:Function = null):this
    tearDown:   tearDown,   // (fn:Await/Function = null):this
    showTable:  showTable   // ():this
};
SQLStorage.LIMIT = (1024 * 1024 * 5) - 1024; // 5MB - 1KB

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function setup(dbName,    // @arg String: db name
               tableName, // @arg String: table name
               fn) {      // @arg Await/Function(= null): fn(err:Error)
                          // @ret this:
                          // @help: SQLStorage#setup
    fn = fn || (function() {});

    var that = this;
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._tableName = tableName;
    this._DDL = this.DDL(tableName);
    this._DML = this.DML(tableName);

    // [iPhone] LIMIT 5MB, Sometimes throw exception in openDatabase
    if (!global.openDatabase) {
        isAwait ? fn.miss() : fn( new TypeError("NOT_IMPL") );
        return this;
    }
    this._db = global.openDatabase(dbName, "1.0", dbName, SQLStorage.LIMIT);
    if (!this._db) {
        isAwait ? fn.miss() : fn( new TypeError("DB_OPEN") );
        return this;
    }
    this._db.transaction(function(tr) {
        tr.executeSql(that._DDL.SETUP, [],
            function(tr, result) {
                isAwait ? fn.pass() : fn(null);
            },
            function(tr, err) {
                isAwait ? fn.miss() : fn(err);
            });
    });
    return this;
}

function DDL(tableName) { // @arg String: table name
                          // @ret Object: { SETUP, TEAR_DOWN }
                          //      SETUP - String:
                          //      TEARDOWN - String:
                          // @help: SQLStorage#DDL
    return {
        SETUP: "CREATE TABLE IF NOT EXISTS " + tableName +
               " (id TEXT PRIMARY KEY,hash TEXT,time INTEGER,data TEXT)",
        TEAR_DOWN: "DROP TABLE " + tableName,
        SHOW_TABLE: "SELECT * FROM sqlite_master WHERE type='table'"
    };
}

function DML(tableName) { // @arg String: table name
                          // @ret Object: { HAS, GET, SET, REMOVE, FETCH, CLEAR }
                          //      HAS - String:
                          //      GET - String:
                          //      SET - String:
                          //      REMOVE - String:
                          //      FETCH - String:
                          //      CLEAR - String:
                          // @help: SQLStorage#DML
    return {
        HAS:    "SELECT COUNT(*) AS length FROM " + tableName + " WHERE id=?",
        GET:    "SELECT id,hash,time,data FROM " + tableName + " WHERE id=?",
        SET:    "INSERT OR REPLACE INTO " + tableName + " VALUES(?,?,?,?)",
        LIST:   "SELECT id FROM " + tableName,
        REMOVE: "DELETE FROM " + tableName + " WHERE id=?",
        FETCH:  "SELECT * FROM " + tableName,
        CLEAR:  "DELETE FROM " + tableName
    };
}

function has(id,   // @arg String:
             fn) { // @arg Function: fn(err:Error, has:Boolean)
                   // @ret this:
                   // @desc: has id
                   // @help: SQLStorage#has
    return _exec(this._db, this._DML.HAS, [id], function(err, result) {
        err ? fn(err,  false)
            : fn(null, !!result.rows.item(0).length);
    });
}

function get(id,   // @arg String:
             fn) { // @arg Function: fn(err:Error, result:Object)
                   // @ret this:
                   // @desc: fetch a row
                   // @help: SQLStorage#get
    return _exec(this._db, this._DML.GET, [id], function(err, result) {
        if (err) {
            fn(err,  null);
        } else {
            if (result.rows.length) {
                fn(null, result.rows.item(0)); // found
            } else {
                fn(null, null); // not found
            }
        }
    });
}

function set(id,     // @arg String:
             values, // @arg Array: [col2value, col3value, ...]
             fn) {   // @arg Function(= null): fn(err:Error)
                     // @ret this:
                     // @desc: add/update row
                     // @help: SQLStorage#set
    return _exec(this._db, this._DML.SET, [id].concat(values), fn);
}

function list(fn) { // @arg Function: fn(err:Error, list:Array)
                    // @ret this:
                    // @desc: add/update row
                    // @help: SQLStorage#list
    return _exec(this._db, this._DML.LIST, [], function(err, result) {
        if (err) {
            fn(err, []);
        } else {
            var rv = [], i = 0, iz = result.rows.length, obj;

            for (; i < iz; ++i) {
                rv.push( result.rows.item(i).id );
            }
            fn(null, rv); // ok
        }
    });
}

function fetch(fn) { // @arg Function: fn(err:Error, result:Object)
                     //    result - Object: { id: { column: value, ...} }
                     // @ret this:
                     // @help: SQLStorage#fetch
    return _exec(this._db, this._DML.FETCH, [], function(err, result) {
        if (err) {
            fn(err, {});
        } else {
            var rv = {}, i = 0, iz = result.rows.length, obj;

            for (; i < iz; ++i) {
                obj = result.rows.item(i);
                rv[obj.id] = obj;
            }
            fn(null, rv); // ok
        }
    });
}

function clear(fn) { // @arg Function(= null): fn(err:Error)
                     // @ret this:
                     // @desc: clear all data
                     // @help: SQLStorage#clear
    return _exec(this._db, this._DML.CLEAR, [], fn);
}

function remove(id,   // @arg String:
                fn) { // @arg Function(= null): fn(err:Error)
                      // @ret this:
                      // @help: SQLStorage#remove
    return _exec(this._db, this._DML.REMOVE, [id], fn);
}

function tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                        // @ret this:
                        // @desc: drop table
                        // @help: SQLStorage#tearDown
    var isAwait = !!(fn && fn.constructor.name === "Await");

    return _exec(this._db, this._DDL.TEAR_DOWN, [], function(err, result) {
        if (fn) {
            if (isAwait) {
                err ? fn.miss() : fn.pass();
            } else {
                err ? fn(err) : fn(null);
            }
        }
    });
}

function showTable() { // @ret this:
                       // @help: SQLStorage#showTable
    return _exec(this._db, this._DDL.SHOW_TABLE, [], function(err, result) {
        var i = 0, iz = result.rows.length, obj, key;

        for (; i < iz; ++i) {
            obj = result.rows.item(i);
            for (key in obj) {
                console.log(key + ": " + obj[key]);
            }
        }
    });
}

function _exec(db,   // @arg DataBase:
               sql,  // @arg String:
               args, // @arg Array(= []): [arg, ...]
               fn) { // @arg Function(= null): fn(err:Error, result:SQLResultSet)
                     // @ret this:
                     // @inner: execute sql statement
    db.transaction(function(tr) {
        tr.executeSql(sql, args || [],
            function(tr, result) {
                fn && fn(null, result); // ok
            }, function(tr, err) {
                if (fn) {
                    fn(err, {});
                } else {
                    throw new TypeError(err.message);
                }
            });
    });
    return this;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { SQLStorage: SQLStorage };
}
global.Monogram || (global.Monogram = {});
global.Monogram.SQLStorage = SQLStorage;

})(this.self || global);
//}@sqlstorage

