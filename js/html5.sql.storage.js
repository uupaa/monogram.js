// html5.sql.storage.js: WebSQLStorage
// @need: mm.js

// mm.iSQLStorage.setup(dbName:String, tableName:String, fn:Function = null):void
// mm.iSQLStorage.has(id:String, fn:Function = null):void
// mm.iSQLStorage.get(id:String, fn:Function = null):void
// mm.iSQLStorage.set(id:String, data:String, fn:Function = null):void
// mm.iSQLStorage.clear(fn:Function = null):void
// mm.iSQLStorage.tearDown(fn:Function = null):void

/* use case

    mm.iSQLStorage.setup("mydb", "mytable", function(err) {
        if (!err) {
            mm.iSQLStorage.set("key", "value");
            mm.iSQLStorage.get("key", function(err, id, time, data) {
                console.log(data);
            });
            mm.iSQLStorage.clear();
        }
    });
 */

//{@sqlstorage
// --------------------------------------------------------
mm.Class("SQLStorage:Singleton", { // mm.iSQLStorage
    init: function() {
        this._db = null;
        this._dbName = "";
        this._tableName = "";
    },
    setup: function(dbName,    // @arg String: db name
                    tableName, // @arg String: table name
                    fn) {      // @arg Function(= null): fn(err:Error)
        this._dbName = dbName;
        this._tableName = tableName;

        // [iPhone] LIMIT 5MB, Sometimes throw exception in openDatabase
        this._db = openDatabase(dbName, "1.0", dbName, 1024 * 1024 * 4.9);
        this._exec("CREATE TABLE IF NOT EXISTS " + tableName +
                   " (id TEXT PRIMARY KEY,time INTEGER,data TEXT)", [], fn);
    },
    has: function(id,   // @arg String:
                  fn) { // @arg Function(= null): fn(has:Boolean)
                        // @desc: has id
        this.get(id, function(err, id, time, data) {
            fn(err || !time ? false : true);
        });
    },
    get: function(id,   // @arg String:
                  fn) { // @arg Function(= null): fn(err:Error, id:String,
                        //                        time:Integer, data:String)
                        // @desc: fetch a row
        var that = this;

        this._db.readTransaction(function(tr) {
            tr.executeSql("SELECT time,data FROM " + that._tableName +
                          " WHERE id=?", [id],
                function(tr, result) {
                    var time = 0, data = "";

                    if (result.rows.length) {
                        time = result.rows.item(0).time;
                        data = result.rows.item(0).data;
                    }
                    fn(null, id, time, data);
                },
                function(tr, error) {
                    fn(error, id, 0, "");
                });
        });
    },
    set: function(id,   // @arg String:
                  data, // @arg String: "" is delete row.
                  fn) { // @arg Function(= null): fn(err:Error)
                        // @desc: add/update row
        if (!data) {
            this._exec("DELETE FROM " + this._tableName +
                       " WHERE id=?", [id], fn);
        } else {
            this._exec("INSERT OR REPLACE INTO " + this._tableName +
                       " VALUES(?,?,?)", [id, Date.now(), data], fn);
        }
    },
    clear: function(fn) { // @arg Function(= null): fn(err:Error)
                          // @desc: clear all data
        this._exec("DELETE FROM " + this._tableName, [], fn);
    },
    tearDown: function(fn) { // @arg Function(= null): fn(err:Error)
                             // @desc: drop table
        this._exec("DROP TABLE " + this._tableName, [], fn);
    },
    _exec: function(sql, args, fn) {
        this._db.transaction(function(tr) {
            tr.executeSql(sql, args, function(tr, result) {
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
});
//}@sqlstorage

