// html5.web.storage.js: WebStorage
// @need: mm.js

// mm.iWebStorage.setup(dbName:String, tableName:String, fn:Function = null):void
// mm.iWebStorage.has(id:String):Boolean
// mm.iWebStorage.get(id:String):Base64String
// mm.iWebStorage.set(id:String, data:Base64String):void
// mm.iWebStorage.clear(fn:Function = null):void
// mm.iWebStorage.tearDown(fn:Function = null):void

/* use case

    mm.iWebStorage.setup("mydb", "mytable");
    mm.iWebStorage.set("id", "base64data");
    node.src = "data:image/png;base64" + mm.iWebStorage.get("id");
 */

//{@webstorage
// --------------------------------------------------------
mm.Class("WebStorage:Singleton", { // mm.iWebStorage
    init: function() {
        this._db = localStorage;
        this._error = "";
        this._dbName = "";
        this._tableName = "__";
    },
    setup: function(dbName,    // @arg String:
                    tableName, // @arg String:
                    fn) {      // @arg Function(= null): fn(err:Error)
        this._dbName = dbName;
        this._tableName = "__" + tableName + "__";
        fn && fn(null);
    },
    has: function(id) { // @arg String:
                        // @ret Boolean:
        return (this._tableName + id) in this._db;
    },
    get: function(id) { // @arg String:
                        // @ret Base64String:
        return this._db.getItem(this._tableName + id) || "";
    },
    set: function(id,     // @arg String:
                  data) { // @arg Base64string:
        data ? this._db.setItem(this._tableName + id, data)
             : this._db.removeItem(this._tableName + id);
    },
    clear: function(fn) { // @arg Function(= null): fn(err:Error)
        for (var key in this._db) {
            if (key.indexOf(this._tableName) === 0) {
                this._db.removeItem(key);
            }
        }
        fn && fn(null);
    },
    tearDown: function(fn) { // @arg Function(= null): fn(err:Error)
        this._db.clear();
        fn && fn(null);
    }
});
//}@webstorage

