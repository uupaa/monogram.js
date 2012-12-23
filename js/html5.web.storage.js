// html5.web.storage.js: WebStorage

//{@webstorage
(function(global) {

// --- header ----------------------------------------------
function WebStorage(dbName,    // @arg String: db name
                    tableName, // @arg String: table name
                    fn) {      // @arg Function(= null): fn(err:Error, instance:this)
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "WebStorage" });

    this._init(dbName, tableName, fn);
}

WebStorage.prototype = {
    _init:  WebStorage_init,
    has:    WebStorage_has,     // WebStorage#has(id:String, fn:Function = null):Boolean
    get:    WebStorage_get,     // WebStorage#get(id:String, fn:Function = null):Base64String
    set:    WebStorage_set,     // WebStorage#set(id:String, data:String, fn:Function = null):this
    fetch:  WebStorage_fetch,   // WebStorage#fetch(fn:Function = null):Object
    clear:  WebStorage_clear,   // WebStorage#clear(fn:Function = null):this
    tearDown:WebStorage_tearDown// WebStorage#tearDown(fn:Function = null):this
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function WebStorage_init(dbName, tableName, fn) {
    this._db = localStorage;
    this._dbName = dbName;
    this._tableName = "__" + tableName + "__";
    fn && fn(null, this); // ok
}

function WebStorage_has(id,   // @arg String:
                        fn) { // @arg Function(= null): fn(has:Boolean)
                              // @ret Boolean:
    var rv = (this._tableName + id) in this._db;

    fn && fn(null, rv);
    return rv;
}

function WebStorage_get(id,   // @arg String:
                        fn) { // @arg Function(= null): fn(err:Error, id:String, data:String)
                              // @ret Base64String:
    var rv = this._db.getItem(this._tableName + id) || "";

    fn && fn(null, id, rv);
    return rv;
}

function WebStorage_set(id,   // @arg String:
                        data, // @arg Base64string:
                        fn) { // @arg Function(= null): fn(err:Error)
                              // @ret this:
    data ? this._db.setItem(this._tableName + id, data)
         : this._db.removeItem(this._tableName + id);
    fn && fn(null); // ok
    return this;
}

function WebStorage_fetch(fn) { // @arg Function(= null): fn(err:Error, result:Object)
                                // @ret Object: result
    var rv = {}, key;

    for (key in this._db) {
        if (key.indexOf(this._tableName) === 0) {
            rv[key] = this._db[key];
        }
    }
    fn && fn(null, rv);
    return rv;
}

function WebStorage_clear(fn) { // @arg Function(= null): fn(err:Error)
                                // @ret this:
    for (var key in this._db) {
        if (key.indexOf(this._tableName) === 0) {
            this._db.removeItem(key);
        }
    }
    fn && fn(null);
    return this;
}

function WebStorage_tearDown(fn) { // @arg Function(= null): fn(err:Error)
                                   // @ret this:
    this._db.clear();
    fn && fn(null);
    return this;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { WebStorage: WebStorage } };
} else {
    global.Monogram || (global.Monogram = {});
    global.Monogram.WebStorage = WebStorage;
}

})(this.self || global);
//}@webstorage

/*
    var WebStorage = reuqire("./html5.web.storage").Monogram.WebStorage;

    function test1() {
        new WebStorage("mydb", "mytable", function(err, storage) {
            storage.set("key", "value");
            node.src = "data:image/png;base64" + storage.get("key");
            storage.clear();
        });
    }
 */
