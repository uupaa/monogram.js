// html5.web.storage.js: WebStorage

//{@webstorage
(function(global) {

// --- header ----------------------------------------------
function WebStorage() {
}
WebStorage.prototype.__proto__  = Monogram.RAMStorage.prototype;
WebStorage.prototype.setup      = WebStorage_setup;    // (dbName:String, tableName:String, fn:Await/Function = null):void
WebStorage.prototype.tearDown   = WebStorage_tearDown; // (fn:Await/Function = null):this

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function WebStorage_setup(dbName,    // @arg String: db name
                          tableName, // @arg String: table name
                          fn) {      // @arg Await/Function(= null): fn(err:Error)
                                     // @ret this:
    var isAwait = !!(fn && fn.constructor.name === "Await");

    if (!global.localStorage) {
        if (fn) {
            isAwait ? fn.miss() : fn( new TypeError("WebStorage NOT_IMPL") );
        }
        return;
    }

    this._db = global.localStorage;
    this._tableName = "__" + tableName + "__";

    fn && ( isAwait ? fn.pass() : fn(null) ); // ok
    return this;
}

function WebStorage_tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                                   // @ret this:
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._db.clear();
    fn && ( isAwait ? fn.pass() : fn(null) ); // ok
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

