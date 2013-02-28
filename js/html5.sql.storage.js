// html5.sql.storage.js: WebSQL Storage

(function(global) {

// --- header ----------------------------------------------
function SQLStorage(dbName,    // @arg String: db name
                    tableName, // @arg String: table name
                    fn) {      // @arg Function(= null): fn(err:Error, instance:this)
    var that = this;

    this._tableName = tableName;
    this._init(dbName, tableName, function(err) {
        fn && fn(err, that);
    });
}

SQLStorage.name = "SQLStorage";
SQLStorage.prototype = {
    constructor:SQLStorage,
    _init:      SQLStorage_init,
    get:        SQLStorage_get,     // #get(id:String, fn:Function = null):void
    set:        SQLStorage_set,     // #set(id:String, data:String,
                                    //                hash:String, fn:Function = null):void
    hash:       SQLStorage_hash,    // #hash(fn):void
    fetch:      SQLStorage_fetch,   // #fetch(id:String, fn:Function = null):void
    remove:     SQLStorage_remove,  // #remove(ids:StringArray, fn:Function = null):void
    clear:      SQLStorage_clear,   // #clear(fn:Function = null):void
    tearDown:   SQLStorage_tearDown // #tearDown(fn:Function = null):void
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function SQLStorage_init(dbName, tableName, fn) {
    this._db = openDatabase(dbName, "1.0", "", 1024 * 1024 * 5 - 1024); // 5MB - 1KB

    var sql = "CREATE TABLE IF NOT EXISTS " + tableName +
              " (id TEXT PRIMARY KEY,hash TEXT,data TEXT)";

    this._db.transaction(function(tr)  { tr.executeSql(sql); },
                         function(err) { fn && fn(err);      },
                         function()    { fn && fn(null);     });
}

function SQLStorage_get(id,   // @arg String:
                        fn) { // @arg Function(= null): fn(err:Error, result)
                              //    result - Object: { data:String, hash:String }
                              // @desc: fetch a row
    var sql = "SELECT hash,data FROM " + this._tableName + " WHERE id=?";
    var ary = [id];

    this._db.readTransaction(function(tr)  { tr.executeSql(sql, ary, _result); },
                             function(err) { fn(err, { data: "", hash: "" });  });

    function _result(tr, result) {
        if (!result.rows.length) {
            fn(null, { data: "", hash: "" });
        }
        var obj = result.rows.item(0);

        return { data: obj.data, hash: obj.hash };
    }
}

function SQLStorage_set(id,   // @arg String:
                        data, // @arg String: "" is delete row.
                        hash, // @arg String(= ""):
                        fn) { // @arg Function(= null): fn(err:Error)
                              // @desc: add/update row
    var sql = "INSERT OR REPLACE INTO " + this._tableName + " VALUES(?,?,?)";
    var ary = [id, hash, data];

    this._db.transaction(function(tr)  { tr.executeSql(sql, ary); },
                         function(err) { fn && fn(err);           },
                         function()    { fn && fn(null);          });
}

function SQLStorage_hash(fn) { // @arg Function: fn(err:Error, hash:Object)
                               //    hash - Object: { id: hash, ... }
    var sql = "SELECT id,hash FROM " + this._tableName;

    this._db.readTransaction(function(tr)  { tr.executeSql(sql, [], _result); },
                             function(err) { fn && fn(err, {}); });

    function _result(tr, result) {
        var rv = {}, i = 0, iz = result.rows.length, obj;

        for (; i < iz; ++i) {
            obj = result.rows.item(i);
            rv[obj.id] = obj.hash;
        }
        fn && fn(null, rv);
    }
}

function SQLStorage_fetch(fn) { // @arg Function: fn(err:Error, result:Object)
                                //    result - Object: { id: { data, hash }, ... }
    var sql = "SELECT * FROM " + this._tableName;

    this._db.readTransaction(function(tr)  { tr.executeSql(sql, [], _result); },
                             function(err) { fn && fn(err, {}); });

    function _result(tr, result) {
        var rv = {}, i = 0, iz = result.rows.length, obj;

        for (; i < iz; ++i) {
            obj = result.rows.item(i);
            rv[obj.id] = { data: obj.data, hash: obj.hash };
        }
        fn && fn(null, rv);
    }
}

function SQLStorage_remove(ids,  // @arg StringArray:
                           fn) { // @arg Function(= null): fn(err:Error)
                                 // @desc: add/update row
    if (!ids.length) {
        fn(null);
        return;
    }
    var sql = "DELETE FROM " + this._tableName + " WHERE " +
              new Array(ids.length + 1).join("id=? AND ").slice(0, -5);

    this._db.transaction(function(tr)  { tr.executeSql(sql, ids); },
                         function(err) { fn && fn(err);           },
                         function()    { fn && fn(null);          });
}

function SQLStorage_clear(fn) { // @arg Function(= null): fn(err:Error)
                                // @desc: clear all data
    var sql = "DELETE FROM " + this._tableName;

    this._db.transaction(function(tr)  { tr.executeSql(sql); },
                         function(err) { fn && fn(err);      },
                         function()    { fn && fn(null);     });
}

function SQLStorage_tearDown(fn) { // @arg Function(= null): fn(err:Error)
                                   // @desc: drop table
    var sql = "DROP TABLE " + this._tableName;

    this._db.transaction(function(tr)  { tr.executeSql(sql); },
                         function(err) { fn && fn(err);      },
                         function()    { fn && fn(null);     });
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { SQLStorage: SQLStorage };
}
global.Monogram || (global.Monogram = {});
global.Monogram.SQLStorage = SQLStorage;

})(this.self || global);


