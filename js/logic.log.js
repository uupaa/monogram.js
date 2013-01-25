// logic.log.js: log

//{@log
(function(global, wiz) {

// --- header ----------------------------------------------
function Log(ooo) { // @var_args Mix: message
                    // @help: Log
    _db.push({
        type: 1, msg: new Date(Date.now()).toJSON().slice(-13, -1) + " " +
                      [].slice.call(arguments).join(" ")
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
    this._tag = (typeof tag === "function" ? _nickname(tag) : tag) + " ";
    this._now = Date.now();

    _db.push({ type: 0x10, msg: this._tag + "()" }) > Log.stock && Log.dump();
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
    _log_index = 0;

// --- implement -------------------------------------------
function LogGroup_log(ooo) {
    _db.push({ type: 0x11, msg: this._tag + [].slice.call(arguments).join(" ") });
}

function LogGroup_warn(ooo) {
    _db.push({ type: 0x12, msg: this._tag + [].slice.call(arguments).join(" ") });
}

function LogGroup_error(ooo) {
    _db.push({ type: 0x13, msg: this._tag + [].slice.call(arguments).join(" ") });
}

function LogGroup_close() {
    _db.push({
        type: 0x14,
        msg: this._tag +
             "(" + new Date(Date.now() - this._now).toJSON().slice(-10, -1) + ")"
    }) > Log.stock && Log.dump();
}

function Log_warn(ooo) {
    _db.push({
        type: 2, msg: new Date(Date.now()).toJSON().slice(-13, -1) + " " +
                      [].slice.call(arguments).join(" ")
    }) > Log.stock && Log_dump();
}

function Log_error(ooo) {
    _db.push({
        type: 3, msg: new Date(Date.now()).toJSON().slice(-13, -1) + " " +
                      [].slice.call(arguments).join(" ")
    }) > Log.stock && Log_dump();
}

function Log_copy() { // @ret: Object { data: [log-data, ...], index: current-index }
                      // @help: Log.copy
                      // @desc: copy log
    return { data: _db.concat(), index: _log_index };
}

function Log_dump() { // @help: Log.dump
                      // @desc: dump log
    var i = _log_index, iz = _db.length, console = global.console;

    for (; i < iz; ++i) {
        switch (_db[i].type & 0xF) {
        case 0x0: console.group(_db[i].msg); break;
        case 0x1: console.log(  _db[i].msg); break;
        case 0x2: console.warn( _db[i].msg); break;
        case 0x3: console.error(_db[i].msg); break;
        case 0x4: console.log(  _db[i].msg); console.groupEnd();
        }
    }
    _log_index = i;
}

function Log_clear() { // @help: Log.clear
                       // @desc: clear log db
    _db = [];
    _log_index = 0;
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

