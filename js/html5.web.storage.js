// html5.web.storage.js: WebStorage (LocalStorage)
// @need: Function#extend in class.extend.js

//{@webstorage
(function(global) {

// --- header ----------------------------------------------
function WebStorage() {
}
WebStorage.extend(global.Monogram.RAMStorage);
WebStorage.name = "WebStorage";
WebStorage.prototype.setup      = setup;    // (dbName:String, tableName:String, fn:Await/Function = null):void
WebStorage.prototype.tearDown   = tearDown; // (fn:Await/Function = null):this

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function setup(dbName,    // @arg String: db name
               tableName, // @arg String: table name
               fn) {      // @arg Await/Function(= null): fn(err:Error)
                          // @ret this:
                          // @help: WebStorage#setup
    fn = fn || (function() {});
    var isAwait = !!(fn && fn.constructor.name === "Await");

    if (!global.localStorage) {
        isAwait ? fn.miss() : fn( new TypeError("NOT_IMPL") );
        return;
    }

    this._db = global.localStorage;
    this._tableName = "__" + tableName + "__";

    isAwait ? fn.pass() : fn(null); // ok
    return this;
}

function tearDown(fn) { // @arg Await/Function(= null): fn(err:Error)
                        // @ret this:
                        // @help: WebStorage#tearDown
    var isAwait = !!(fn && fn.constructor.name === "Await");

    this._db.clear();
    fn && ( isAwait ? fn.pass() : fn(null) ); // ok
    return this;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { WebStorage: WebStorage };
}
global.Monogram || (global.Monogram = {});
global.Monogram.WebStorage = WebStorage;

})(this.self || global);
//}@webstorage

