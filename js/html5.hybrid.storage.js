// html5.hybrid.storage.js: WebSQLString + RAM Cache
// @need: mm.js

// mm.iCache.setup(dbName:String, tableName:String, fn:Function = null):void
// mm.iCache.has(id:String):void
// mm.iCache.get(id:String):void
// mm.iCache.set(id:String, data:String):void
// mm.iCache.clear(fn:Function = null):void
// mm.iCache.tearDown(fn:Function = null):void

/* use case

    mm.iCache.setup("mydb", "mytable", function(err) {
        if (!err) {
            mm.iCache.set("id", "base64data");
            mm.iCache.has("id"); // true

            node.src = "data:image/png;base64" + mm.iCache.get("id");

            mm.iCache.clear();
        }
    });
 */

//{@hybridstorage
// --------------------------------------------------------
mm.Class("Cache:Singleton", { // mm.iCache
    init: function() {
        this._db = null;        // Object:
        this._error = "";       // String:
        this._dbName = "";      // String:
        this._tableName = "";   // String:
        this._cache = {};       // Object: on memory cache data. { key: value }
        this._writeQueue = [];  // Array: [<id, data>, ...]
    },
    setup: function(dbName,    // @arg String: db name
                    tableName, // @arg String: table name
                    fn) {      // @arg Function(= null): fn(err:Error)
        var that = this;

        this._dbName = dbName;
        this._tableName = tableName;

        // [iPhone] LIMIT 5MB, Sometimes throw exception in openDatabase
        this._db = openDatabase(dbName, "1.0", dbName, 1024 * 1024 * 4.9);
        this._db.transaction(function(tr) {
            tr.executeSql("CREATE TABLE IF NOT EXISTS " + tableName +
                          " (id TEXT PRIMARY KEY,data TEXT)", [],
                function(tr, result) {
                    that._fetch(fn);
                },
                function(tr, err) {
                    fn && fn(err);
                });
        });
    },
    has: function(id) { // @arg String:
                        // @ret Boolean:
                        // @desc: has id
        return id in this._cache;
    },
    get: function(id) { // @arg String:
                        // @ret String:
                        // @desc: fetch a row
        return this._cache[id] || "";
    },
    set: function(id,     // @arg String:
                  data) { // @arg String: "" is delete row.
                          // @desc: add/update row
        var that = this;

        if (data) {
            this._cache[id] = data;
        } else {
            delete this._cache[id];
        }
        this._writeQueue.push(id, data);
        this._startQueue();
    },
    clear: function(fn) { // @arg Function(= null): fn(err:Error)
                          // @desc: clear all data
        this._stopQueue();
        this._cache = {};
        this._exec("DELETE FROM " + this._tableName, [], fn);
    },
    tearDown: function(fn) { // @arg Function(= null): fn(err:Error)
                             // @desc: drop table
        this._stopQueue();
        this._cache = {};
        this._exec("DROP TABLE " + this._tableName, [], fn);
    },
    _fetch: function(fn) { // @arg Function: fn(err:Error)
        var that = this;

        this._db.readTransaction(function(tr) {
            tr.executeSql("SELECT * FROM " + that._tableName, [], function(tr, result) {
                var i = 0, iz = result.rows.length, obj;

                for (; i < iz; ++i) {
                    obj = result.rows.item(i);
                    that._cache[obj.id] = obj.data;
                }
                fn && fn(null); // ok
            }, function(tr, error) {
                fn && fn(error);
            });
        });
    },
    _exec: function(sql,  // @arg String:
                    args, // @arg Array(= []): [arg, ...]
                    fn) { // @arg Function(= null): fn(err:Error)
        this._db.transaction(function(tr) {
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
    },
    _startQueue: function() {
        var that = this;

        if (this._writeQueue.length) {
            this._stopQueue();
            this._timerID = setTimeout(_tick, 0);
        }

        function _tick() {
            var id   = that._writeQueue.shift();
            var data = that._writeQueue.shift();

            if (!data) {
                that._exec("DELETE FROM " + that._tableName + " WHERE id=?", [id],
                    function(err) {
                        if (err) {
                            that._stopQueue();
                            that._error = err.message;
                        } else {
                            that._startQueue();
                        }
                    });
            } else {
                that._exec("INSERT OR REPLACE INTO " + that._tableName + " VALUES(?,?)", [id, data],
                    function(err) {
                        if (err) {
                            that._stopQueue();
                            that._error = err.message;
                        } else {
                            that._startQueue();
                        }
                    });
            }
        }
    },
    _stopQueue: function() {
        if (this._timerID) {
            clearTimeout(this._timerID);
            this._timerID = 0;
        }
    }
});
//}@hybridstorage

