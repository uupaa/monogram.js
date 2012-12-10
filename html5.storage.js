// html5.storage.js: WebStorage and WebSQL
// @need: mm.js

// mm.iCache.setup(dbName:String, tableName:String):void
// mm.iCache.has(id:String):Boolean
// mm.iCache.set(id:String, data:Base64String):void
// mm.iCache.get(id:String):Base64String
// mm.iCache.clear():void
// mm.iCache.tearDown():void
//
// mm.iSQLStorage.setup(dbName:String, tableName:String, fn:Function = null):void
// mm.iSQLStorage.has(id:String, fn:Function = null):void
// mm.iSQLStorage.get(id:String, fn:Function = null):void
// mm.iSQLStorage.set(id:String, data:String, fn:Function = null):void
// mm.iSQLStorage.clear(fn:Function = null):void
// mm.iSQLStorage.tearDown(fn:Function = null):void

/* use case

    mm.iCache.set("id", "base64data");
    node.src = "data:image/png;base64" + mm.iCache.get("id");

    mm.iSQLStorage.setup("mydb", "mytable", mm.nop);
    mm.iSQLStorage.set("key", "value", mm.nop);
    mm.iSQLStorage.get("key", function(err, id, time, data) {
        console.log(data);
    });
    mm.iSQLStorage.tearDown();

 */

// --------------------------------------------------------
mm.Class("Cache:Singleton", { // mm.iCache
    init: function() {
        this._db = localStorage;
        this._dbName = "";
        this._tableName = "__";
    },
    setup: function(dbName,      // @arg String:
                    tableName) { // @arg String:
        this._dbName = dbName;
        this._tableName = "__" + tableName + "__";
    },
    has: function(id) { // @arg String:
                        // @ret Boolean:
//{@debug
        mm.allow("id", id, "String");
//}@debug
        return (this._tableName + id) in this._db;
    },
    set: function(id,     // @arg String:
                  data) { // @arg Base64string:
//{@debug
        mm.allow("id",   id,   "String");
        mm.allow("data", data, "String");
//}@debug
        data ? this._db.setItem(this._tableName + id, data)
             : this._db.removeItem(this._tableName + id);
    },
    get: function(id) { // @arg String:
                        // @ret Base64String:
//{@debug
        mm.allow("id", id, "String");
//}@debug
        return this._db.getItem(this._tableName + id) || "";
    },
    clear: function() {
        for (var key in this._db) {
            if (key.indexOf(this._tableName) === 0) {
                this._db.removeItem(key);
            }
        }
    },
    tearDown: function() {
        this._db.clear();
    }
});

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
//{@debug
        mm.allow("dbName",    dbName,    "String");
        mm.allow("tableName", tableName, "String");
        mm.allow("fn",        fn,        "Function/undefined");
//}@debug
        this._dbName = dbName;
        this._tableName = tableName;

        // [iPhone] LIMIT 5MB, Sometimes throw exception in openDatabase
        this._db = openDatabase(dbName, "1.0", dbName, 512000);
        this._exec("CREATE TABLE IF NOT EXISTS " + tableName +
                   " (id TEXT PRIMARY KEY,time INTEGER,data TEXT)", [], fn);
    },
    has: function(id,   // @arg String:
                  fn) { // @arg Function(= null): fn(has:Boolean)
                        // @desc: has id
//{@debug
        mm.allow("id", id, "String");
        mm.allow("fn", fn, "Function/undefined");
//}@debug
        this.get(id, function(err, id, time, data) {
            fn(err || !time ? false : true);
        });
    },
    get: function(id,   // @arg String:
                  fn) { // @arg Function(= null): fn(err:Error, id:String,
                        //                        time:Integer, data:String)
                        // @desc: fetch a row
//{@debug
        mm.allow("id", id, "String");
        mm.allow("fn", fn, "Function/undefined");
//}@debug
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
//{@debug
        mm.allow("id",   id,   "String");
        mm.allow("data", data, "String");
        mm.allow("fn",   fn,   "Function/undefined");
//}@debug
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
//{@debug
        mm.allow("fn", fn, "Function/undefined");
//}@debug
        this._exec("DELETE FROM " + this._tableName, [], fn);
    },
    tearDown: function(fn) { // @arg Function(= null): fn(err:Error)
                             // @desc: drop table
//{@debug
        mm.allow("fn", fn, "Function/undefined");
//}@debug
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

