// html5.sql.storage.js: WebSQLStorage

//{@sqlstorage
(function(global) {

// --- header ----------------------------------------------
function SQLStorage() {
}
SQLStorage.prototype = {
    constructor:SQLStorage,
    DDL:        SQLStorage_DDL,     // SQLStorage#DDL():Object - { SETUP, TEAR_DOWN }
    DML:        SQLStorage_DML,     // SQLStorage#DML():Object - { HAS, GET, SET, REMOVE, FETCH, CLEAR }
    setup:      SQLStorage_setup,   // SQLStorage#setup(dbName:String, tableName:String, fn:Await/Function = null):this
    has:        SQLStorage_has,     // SQLStorage#has(id:String, fn:Function):this
    get:        SQLStorage_get,     // SQLStorage#get(id:String, fn:Function):this
    set:        SQLStorage_set,     // SQLStorage#set(id:String, values:Array, fn:Function = null):this
    list:       SQLStorage_list,    // SQLStorage#list(fn:Function):this
    fetch:      SQLStorage_fetch,   // SQLStorage#fetch(id:String, fn:Function):this
    clear:      SQLStorage_clear,   // SQLStorage#clear(fn:Function = null):this
    remove:     SQLStorage_remove,  // SQLStorage#remove(id:String, fn:Function = null):this
    tearDown:   SQLStorage_tearDown,// SQLStorage#tearDown(fn:Await/Function = null):this
    showTable:  SQLStorage_showTable// SQLStorage#showTable():this
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function SQLStorage_setup(dbName,    // @arg String: db name
                          tableName, // @arg String: table name
                          fn) {      // @arg Await/Function(= null): fn(err:Error)
                                     // @ret this:
alert(this.constructor.name);
    var that = this;
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._tableName = tableName;
    this._DDL = this.DDL(tableName);
    this._DML = this.DML(tableName);

    var limit = (1024 * 1024 * 5) - 1024; // 5MB - 1KB

    // [iPhone] LIMIT 5MB, Sometimes throw exception in openDatabase
    this._db = openDatabase(dbName, "1.0", dbName, limit);
    this._db.transaction(function(tr) {
        tr.executeSql(that._DDL.SETUP, [],
            function(tr, result) {
                fn && ( isAwait ? fn.pass() : fn(null) );
            },
            function(tr, err) {
                fn && ( isAwait ? fn.miss() : fn(err) );
            });
    });
    return this;
}

function SQLStorage_DDL(tableName) { // @arg String: table name
                                     // @ret Object: { SETUP, TEAR_DOWN }
                                     //      SETUP - String:
                                     //      TEARDOWN - String:
    return {
        SETUP: "CREATE TABLE IF NOT EXISTS " + tableName +
               " (id TEXT PRIMARY KEY,hash TEXT,time INTEGER,data TEXT)",
        TEAR_DOWN: "DROP TABLE " + tableName,
        SHOW_TABLE: "SELECT * FROM sqlite_master WHERE type='table'"
    };
}

function SQLStorage_DML(tableName) { // @arg String: table name
                                     // @ret Object: { HAS, GET, SET, REMOVE, FETCH, CLEAR }
                                     //      HAS - String:
                                     //      GET - String:
                                     //      SET - String:
                                     //      REMOVE - String:
                                     //      FETCH - String:
                                     //      CLEAR - String:
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

function SQLStorage_has(id,   // @arg String:
                        fn) { // @arg Function: fn(err:Error, has:Boolean)
                              // @ret this:
                              // @desc: has id
    return _exec(this._db, this._DML.HAS, [id], function(err, result) {
        err ? fn(err,  false)
            : fn(null, !!result.rows.item(0).length);
    });
}

function SQLStorage_get(id,   // @arg String:
                        fn) { // @arg Function: fn(err:Error, result:Object)
                              // @ret this:
                              // @desc: fetch a row
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

function SQLStorage_set(id,     // @arg String:
                        values, // @arg Array: [col2value, col3value, ...]
                        fn) {   // @arg Function(= null): fn(err:Error)
                                // @ret this:
                                // @desc: add/update row
    return _exec(this._db, this._DML.SET, [id].concat(values), fn);
}

function SQLStorage_list(fn) { // @arg Function: fn(err:Error, list:Array)
                               // @ret this:
                              // @desc: add/update row
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

function SQLStorage_fetch(fn) { // @arg Function: fn(err:Error, result:Object)
                                //    result - Object: { id: { column: value, ...} }
                                // @ret this:
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

function SQLStorage_clear(fn) { // @arg Function(= null): fn(err:Error)
                                // @ret this:
                                // @desc: clear all data
    return _exec(this._db, this._DML.CLEAR, [], fn);
}

function SQLStorage_remove(id,   // @arg String:
                           fn) { // @arg Function(= null): fn(err:Error)
                                 // @ret this:
    return _exec(this._db, this._DML.REMOVE, [id], fn);
}

function SQLStorage_tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                                   // @ret this:
                                   // @desc: drop table
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

function SQLStorage_showTable() { // @ret this:
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

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { SQLStorage: SQLStorage } };
} else {
    global.Monogram || (global.Monogram = {});
    global.Monogram.SQLStorage = SQLStorage;
}

})(this.self || global);
//}@sqlstorage

