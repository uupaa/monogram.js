// html5.sql.storage.js: WebSQLStorage

//{@sqlstorage
(function(global) {

// --- header ----------------------------------------------
function SQLStorage(dbName,    // @arg String: db name
                    tableName, // @arg String: table name
                    fn) {      // @arg Function(= null): fn(err:Error, instance:this)
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "SQLStorage" });

    this._init(dbName, tableName, fn);
}

SQLStorage.prototype = {
    _init:      SQLStorage_init,
    has:        SQLStorage_has,         // SQLStorage#has(id:String, fn:Function = null):void
    get:        SQLStorage_get,         // SQLStorage#get(id:String, fn:Function = null):void
    set:        SQLStorage_set,         // SQLStorage#set(id:String, data:String, time:Integer, fn:Function = null):void
    fetch:      SQLStorage_fetch,       // SQLStorage#fetch(id:String, fn:Function = null):void
    clear:      SQLStorage_clear,       // SQLStorage#clear(fn:Function = null):void
    tearDown:   SQLStorage_tearDown,    // SQLStorage#tearDown(fn:Function = null):void
    showTable:  SQLStorage_showTable    // SQLStorage#showTable():void
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function SQLStorage_init(dbName, tableName, fn) {
    var that = this;

    this._dbName = dbName;
    this._tableName = tableName;

    var limit = (1024 * 1024 * 5) - 1024; // 5MB - 1KB

    // [iPhone] LIMIT 5MB, Sometimes throw exception in openDatabase
    this._db = openDatabase(dbName, "1.0", dbName, limit);
    this._db.transaction(function(tr) {
        var sql = "CREATE TABLE IF NOT EXISTS " + tableName +
                  " (id TEXT PRIMARY KEY,time INTEGER,data TEXT)";
        // console.log(sql);
        tr.executeSql(sql, [],
            function(tr, result) {
                fn && fn(null, that); // ok
            },
            function(tr, err) {
                fn && fn(err, that);
            });
    });
}

function SQLStorage_has(id,   // @arg String:
                        fn) { // @arg Function(= null): fn(has:Boolean)
                              // @desc: has id
    this.get(id, function(err, id, data) {
        fn(err || !id ? false : true);
    });
}

function SQLStorage_get(id,   // @arg String:
                        fn) { // @arg Function(= null): fn(err:Error, id:String, data:String, time:INTEGER)
                              // @desc: fetch a row
    var that = this;

    this._db.readTransaction(function(tr) {
        tr.executeSql("SELECT time,data FROM " + that._tableName +
                      " WHERE id=?", [id],
            function(tr, result) {
                var time = 0;
                var data = "";

                if (result.rows.length) {
                    time = result.rows.item(0).time;
                    data = result.rows.item(0).data;
                }
                fn(null, id, data, +time);
            },
            function(tr, error) {
                fn(error, "", "", "");
            });
    });
}

function SQLStorage_set(id,   // @arg String:
                        data, // @arg String: "" is delete row.
                        time, // @arg Integer(= 0):
                        fn) { // @arg Function(= null): fn(err:Error)
                              // @desc: add/update row
    if (!data) {
        _exec(this._db, "DELETE FROM " + this._tableName +
                        " WHERE id=?", [id], fn);
    } else {
        _exec(this._db, "INSERT OR REPLACE INTO " + this._tableName +
                        " VALUES(?,?,?)", [id, time, data], fn);
    }
}

function SQLStorage_fetch(fn) { // @arg Function: fn(err:Error, result:Object, times:Object)
                                //    result - Object: { id: data, ... }
                                //    times - Object: { id: time, ... }
    var that = this;

    this._db.readTransaction(function(tr) {
        tr.executeSql("SELECT * FROM " + that._tableName, [],
            function(tr, result) {
                var rv = {}, times = {}, i = 0, iz = result.rows.length, obj;

                for (; i < iz; ++i) {
                    obj = result.rows.item(i);
                    rv[obj.id] = obj.data;
                    times[obj.id] = +obj.time;
                }
                fn && fn(null, rv, times); // ok
            }, function(tr, error) {
                fn && fn(error, {}, {});
            });
    });
}

function SQLStorage_clear(fn) { // @arg Function(= null): fn(err:Error)
                                // @desc: clear all data
    _exec(this._db, "DELETE FROM " + this._tableName, [], fn);
}

function SQLStorage_tearDown(fn) { // @arg Function(= null): fn(err:Error)
                                   // @desc: drop table
    _exec(this._db, "DROP TABLE " + this._tableName, [], fn);
}

function SQLStorage_showTable() {
    this._db.transaction(function(tr) {
        tr.executeSql("SELECT * FROM sqlite_master WHERE type='table'", [], function(tr, result) {
            var i = 0, iz = result.rows.length, obj, key;

            for (; i < iz; ++i) {
                obj = result.rows.item(i);
                for (key in obj) {
                    console.log(key + ": " + obj[key]);
                }
            }
        }, function(tr, error) {
        });
    });
}

function _exec(db,
               sql,  // @arg String:
               args, // @arg Array(= []): [arg, ...]
               fn) { // @arg Function(= null): fn(err:Error)
    db.transaction(function(tr) {
        tr.executeSql(sql, args || [], function(tr, result) {
            fn && fn(null); // ok
        }, function(tr, error) {
            if (fn) {
                fn(error);
            } else {
                throw new TypeError(error.message);
            }
        });
    });
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

/*
    var SQLStorage = reuqire("./html5.sql.storage").Monogram.SQLStorage;

    function test1() {
        new SQLStorage("mydb", "mytable", function(err, storage) {
            storage.set("key", "value", function(err) {
                storage.get("key", function(err, id, data) {
                    console.log(data);
                });
                storage.clear();
            });
        });
    }
 */

