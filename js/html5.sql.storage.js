// html5.sql.storage.js: WebSQL Storage

//{@sqlstorage
(function(global) {

// --- header ----------------------------------------------
function SQLStorage() {
}
SQLStorage.name = "SQLStorage"; // fn.constructor.name -> "SQLStorage"
SQLStorage.prototype = {
    constructor:SQLStorage,
    setup:      setup,      // (dbName:String, tableName:String, fn:Await/Function = null):this
    has:        has,        // (ids:String/StringArray, fn:Function):this
    get:        get,        // (ids:String/StringArray, fn:Function):this
    set:        set,        // (values:Array, fn:Function = null):this
    list:       list,       // (fn:Function):this
    fetch:      fetch,      // (fn:Function):this
    clear:      clear,      // (fn:Function = null):this
    remove:     remove,     // (id:String, fn:Function = null):this
    tearDown:   tearDown,   // (fn:Await/Function = null):this
    showTable:  showTable,  // ():this
    // --- override ---
    DDL:        DDL,        // ():Object - { SETUP, TEAR_DOWN }
    DML:        DML         // ():Object - { HAS, GET, SET, REMOVE, FETCH, CLEAR }
};
SQLStorage.LIMIT = (1024 * 1024 * 5) - 1024; // 5MB - 1KB

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function setup(dbName,    // @arg String: db name
               tableName, // @arg String: table name
               fn) {      // @arg Await/Function(= null): fn(err:Error)
                          // @ret this:
                          // @help: SQLStorage#setup
    this._db = null;
    this._tableName = tableName;
    this._DDL = this.DDL(tableName);
    this._DML = this.DML(tableName);

    // [iPhone] LIMIT 5MB, Sometimes throw exception in openDatabase
    if (global.openDatabase) {
        this._db = global.openDatabase(dbName, "1.0", dbName, SQLStorage.LIMIT);
    }
    if (!this._db) {
        var err = new TypeError("openDatabase is not function");
        if (fn) {
            fn.miss ? fn.miss(err) : fn(err); // await.miss(err)
        }
        return this;
    }
    return _exec(this, false, this._DDL.SETUP, [], function(err, result) {
        if (fn) {
            err ? (fn.miss ? fn.miss(err) : fn(err))
                : (fn.pass ? fn.pass()    : fn());
        }
    });
}

function DDL(tableName) { // @arg String: table name
                          // @ret Object: { SETUP, COLUMNS, TEAR_DOWN }
    return {
        SETUP: "CREATE TABLE IF NOT EXISTS " + tableName + " (" +
                    "id TEXT PRIMARY KEY," +
                    "hash TEXT," +
                    "time INTEGER," +
                    "data TEXT)",
        TEAR_DOWN: "DROP TABLE " + tableName,
        SHOW_TABLE: "SELECT * FROM sqlite_master " +
                    "WHERE type='table' and name='" + tableName + '"'
    };
}

function DML(tableName) { // @arg String: table name
                          // @ret Object: { HAS, GET, SET, REMOVE, FETCH, CLEAR }
    return {
        HAS:    "SELECT COUNT(*) AS length FROM " + tableName + " WHERE id=?",
        GET:    "SELECT id,hash,time,data FROM " + tableName + " WHERE id=?",
        SET:    "INSERT OR REPLACE INTO " + tableName + " VALUES",
        VALUES: "(?,?,?,?,?)",
        LIST:   "SELECT id FROM " + tableName,
        FETCH:  "SELECT * FROM " + tableName,
        CLEAR:  "DELETE FROM " + tableName,
        REMOVE: "DELETE FROM " + tableName + " WHERE id=?"
    };
}

function has(ids,  // @arg String/StringArray:
             fn) { // @arg Function: fn(err:Error, hasAll:Boolean, ids:StringArray)
                   // @ret this:
                   // @desc: has id
                   // @help: SQLStorage#has
    var sql = this._DML.HAS;

    if (typeof ids === "string") {
        ids = [ids];
    } else {
        sql += new Array(ids.length).join(" OR id=?"); // WHERE id=? OR id=? ...
    }
    return _exec(this, true, sql, ids, function(err, result) {
        if (err) {
            fn(err, false, []);
        } else {
            var rv = [], i = 0, iz = result.rows.length;

            for (; i < iz; ++i) {
                rv.push( result.rows.item(i).id );
            }
            fn(null, rv.length === ids.length, rv);
        }
    });
}

function get(ids,  // @arg String/StringArray:
             fn) { // @arg Function: fn(err:Error, result:ObjectArray)
                   // @ret this:
                   // @desc: fetch a row
                   // @help: SQLStorage#get
    var sql = this._DML.GET;

    if (typeof ids === "string") {
        ids = [ids];
    } else {
        sql += new Array(ids.length).join(" OR id=?"); // WHERE id=? OR id=? ...
    }

    return _exec(this, true, sql, ids, function(err, result) {
        if (err) {
            fn(err,  []);
            return;
        }
        var rv = [], i = 0, iz = result.rows.length;

        for (; i < iz; ++i) {
            rv.push( result.rows.item(i) );
        }
        fn(null, rv);
    });
}

function set(values, // @arg Array: [<id, hash, time, data>, <...>, ...]
             fn) {   // @arg Function(= null): fn(err:Error)
                     // @ret this:
                     // @desc: add/update row
                     // @help: SQLStorage#set
    var vals = [], i = 0, iz = (values.length / this._DDL_COLUMNS) | 0;

    if (values.length % this._DDL_COLUMNS) {
        throw new TypeError("BAD_COLUMNS");
    }
    // insert multiple rows.
    //      INSERT OR REPLACE INTO tableName VALUES(?,?,?,?,?),(?,?,?,?,?)...
    for (; i < iz; ++i) {
        vals.push( this._DML.VALUES ); // ["(?,?,?,?,?)", ...]
    }
    return _exec(this, false, this._DML.SET + vals, values, fn);
}

function list(fn) { // @arg Function: fn(err:Error, list:Array)
                    // @ret this:
                    // @desc: add/update row
                    // @help: SQLStorage#list
    return _exec(this, true, this._DML.LIST, [], function(err, result) {
        if (err) {
            fn(err, []);
        } else {
            var rv = [], i = 0, iz = result.rows.length;

            for (; i < iz; ++i) {
                rv.push( result.rows.item(i).id );
            }
            fn(null, rv); // ok
        }
    });
}

function fetch(fn) { // @arg Function: fn(err:Error, result:ObjectArray)
                     //    result - ObjectArray: [{ id, hash, time, data }, ...]
                     // @ret this:
                     // @help: SQLStorage#fetch
    return _exec(this, true, this._DML.FETCH, [], function(err, result) {
        if (err) {
            fn(err, []);
        } else {
            var rv = [], i = 0, iz = result.rows.length;

            for (; i < iz; ++i) {
                rv.push( result.rows.item(i) );
            }
            fn(null, rv); // ok
        }
    });
}

function clear(fn) { // @arg Function(= null): fn(err:Error)
                     // @ret this:
                     // @desc: clear all data
                     // @help: SQLStorage#clear
    return _exec(this, false, this._DML.CLEAR, [], fn);
}

function remove(id,   // @arg String:
                fn) { // @arg Function(= null): fn(err:Error)
                      // @ret this:
                      // @help: SQLStorage#remove
    return _exec(this, false, this._DML.REMOVE, [id], fn);
}

function tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                        // @ret this:
                        // @desc: drop table
                        // @help: SQLStorage#tearDown
    return _exec(this, false, this._DDL.TEAR_DOWN, [], function(err, result) {
        if (fn) {
            if (err) {
                fn.miss ? fn.miss(err) : fn(err);
            } else {
                fn.pass ? fn.pass() : fn();
            }
        }
    });
}

function showTable() { // @ret this:
                       // @help: SQLStorage#showTable
    return _exec(this, true, this._DDL.TABLE, [], function(err, result) {
        var i = 0, iz = result.rows.length, obj, key;

        for (; i < iz; ++i) {
            obj = result.rows.item(i);
            for (key in obj) {
                console.log(key + ": " + obj[key]);
            }
        }
    });
}

function _exec(that, // @arg DataBase:
               read, // @arg Boolean: true is read, false is write
               sql,  // @arg String:
               args, // @arg Array(= []): [arg, ...]
               fn) { // @arg Function(= null): fn(err:Error, result:SQLResultSet)
                     // @ret that:
                     // @inner: execute sql statement
    that._db[read ? "readTransaction" : "transaction"](function(tr) {
        tr.executeSql(sql, args || [],
            function(tr, result) {
                fn && fn(null, result); // ok
            }, function(tr, err) {
                fn && fn(err, {});
            });
    });
    return that;
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

