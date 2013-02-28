// logic.log.js: log

//{@log
(function(global, wiz) {

// --- header ----------------------------------------------
function Log(ooo) { // @var_args Mix: message
                    // @help: Log
    _db.push({
        tag:    "",
        type:   "log",
        group:  false,
        diff:   _diff(),
        time:   Date.now(),
        args:   [].slice.call(arguments)
    }) > Log.stock && Log.dump();
}
Log.name  = "Log";
Log.copy  = Log_copy;   // Log.copy():Object
Log.dump  = Log_dump;   // Log.dump():void
Log.warn  = Log_warn;   // Log.warn(...:Mix):void
Log.error = Log_error;  // Log.error(...:Mix):void
Log.clear = Log_clear;  // Log.clear():void
Log.stock = 0;          // Log.stock - Integer: log stock length

function LogGroup(tag) { // @arg String/Function: tag (group name)
    this._tag = typeof tag === "function" ? _nickname(tag) : tag;

    _db.push({
        tag:    this._tag,
        type:   "group",
        group:  true,
        diff:   0,
        time:   Date.now(),
        args:   []
    });
}
Log.group = LogGroup;
Log.group.name = "LogGroup";
LogGroup.prototype = {
    constructor:LogGroup,
    log:        LogGroup_log,
    warn:       LogGroup_warn,
    error:      LogGroup_error,
    close:      LogGroup_close
};

// --- library scope vars ----------------------------------
var _db = [],
    _lastTime = 0,
    _lastIndex = 0;

// --- implement -------------------------------------------
function _diff() {
    var now = Date.now(), diff;

    _lastTime || (_lastTime = now);
    diff = new Date(now - _lastTime).getTime();

    _lastTime = now;
    return diff;
}

function LogGroup_log(ooo) {
    _db.push({
        tag:    this._tag,
        type:   "log",
        group:  true,
        diff:   _diff(),
        time:   0,
        args:   [].slice.call(arguments)
    });
}

function LogGroup_warn(ooo) {
    _db.push({
        tag:    this._tag,
        type:   "warn",
        group:  true,
        diff:   _diff(),
        time:   0,
        args:   [].slice.call(arguments)
    });
}

function LogGroup_error(ooo) {
    _db.push({
        tag:    this._tag,
        type:   "error",
        group:  true,
        diff:   _diff(),
        time:   0,
        args:   [].slice.call(arguments)
    });
}

function LogGroup_close() {
    _db.push({
        tag:    this._tag,
        type:   "close",
        group:  true,
        diff:   _diff(),
        time:   Date.now(),
        args:   []
    }) > Log.stock && Log.dump();
}

function Log_warn(ooo) {
    _db.push({
        tag:    "",
        type:   "warn",
        group:  false,
        diff:   _diff(),
        time:   Date.now(),
        args:   [].slice.call(arguments)
    }) > Log.stock && Log_dump();
}

function Log_error(ooo) {
    _db.push({
        tag:    "",
        type:   "error",
        group:  false,
        diff:   _diff(),
        time:   Date.now(),
        args:   [].slice.call(arguments)
    }) > Log.stock && Log_dump();
}

function Log_copy() { // @ret: Object { logs: [log-data, ...], index: current-index }
                      // @help: Log.copy
                      // @desc: copy log
    return { logs: _db.concat(), lastIndex: _lastIndex };
}

function Log_dump() { // @help: Log.dump
                      // @desc: dump log
    function _msg(db) {
        var rv = "";

        if (db.tag) {
            rv += db.tag + ":";
        }
        if (db.time) {
            rv += "["  + new Date(db.time).toJSON().slice(-13, -1) + "]";
        }
        if (db.diff) {
            rv += "(+" + new Date(db.diff).toJSON().slice(-10, -1) + ")";
        }
        if (db.args) {
            rv += " " + db.args.join(", ");
        }
        return rv;
    }

    var i = _lastIndex, iz = _db.length, console = global.console;

    for (; i < iz; ++i) {
        switch (_db[i].type) {
        case "group":   console.group(_msg(_db[i])); break;
        case "log":     console.log(  _msg(_db[i])); break;
        case "warn":    console.warn( _msg(_db[i])); break;
        case "error":   console.error(_msg(_db[i])); break;
        case "close":   console.log(  _msg(_db[i])); console.groupEnd();
        }
    }
    _lastIndex = i;
}

function Log_clear() { // @help: Log.clear
                       // @desc: clear log db
    _db = [];
    _lastIndex = 0;
}

function _nickname(that) { // copy from Function#nickname
    var name = that.name || (that + "").split("\x28")[0].trim().slice(9);

    return name ? name.replace(/^mm_/, "mm.") : "";
}

function nop() {
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Log: Log };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Log = Log;

// polyfill
global.console          || (global.console = {});
global.console.log      || (global.console.log = nop);
global.console.warn     || (global.console.warn = nop);
global.console.error    || (global.console.error = nop);
global.console.group    || (global.console.group = nop);
global.console.groupEnd || (global.console.groupEnd = nop);

})(this.self || global);
//}@log

