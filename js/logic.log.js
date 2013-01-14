// logic.log.js: log

//{@log
(function(global, wiz) {

function Log(ooo) { // @var_args Mix: message
                    // @help: Log
                    // @desc: push log db
    _log_db.push({
        type: 0,
        time: Date.now(),
        msg:  [].slice.call(arguments).join(" ")
    });
    _log_db.length > _log_limit && Log.dump();
}

function LogGroup(lable,  // @arg String/Function: label (group name)
                  mode) { // @arg Interger(= 0x0): 0x4 is perf mode
                          //     mode = 0x0 - normal
                          //     mode = 0x1 - warn
                          //     mode = 0x2 - error
    if (typeof label === "function") {
        label = _nickname(label);
    }

    var now = Date.now();

    this._nest = _log_nest++;
    this._mode = mode || 0;

    _log_db.push({
        type: this._mode,
        time: Date.now(),
        msg:  this._raw(1, "")
    });
}

Log.name  = "Log";
Log.copy  = Log_copy;   // Log.copy():Object
Log.dump  = Log_dump;   // Log.dump(url:String = ""):void
Log.warn  = Log_warn;   // Log.warn(...:Mix):void
Log.error = Log_error;  // Log.error(...:Mix):void
Log.clear = Log_clear;  // Log.clear():void
Log.group = LogGroup;
Log.group.name = "LogGroup";
LogGroup.prototype = {
    constructor:LogGroup,
    log:        LogGroup_log,
    warn:       LogGroup_warn,
    error:      LogGroup_error,
    close:      LogGroup_close,
    _raw:       LogGroup_raw
};

// --- header ----------------------------------------------

// --- library scope vars ----------------------------------
var _log_db = [],
    _log_nest = 0,
    _log_index = 0,
    _log_limit = 0,  // Integer: stock length
    _parts = (function(nav) {
        var lang = nav.language || nav.browserLanguage || "";

        return lang === "ja" ? ["\u2502", "\u250c", "\u2502", "\u2514"]
                             : ["|",      "+-",     "| ",     "`-"    ];
    })(global.navigator || {});

// --- implement -------------------------------------------
function Log_copy() { // @ret: Object { data: [log-data, ...], index: current-index }
                      // @help: Log.copy
                      // @desc: copy log
    return { data: _log_db.concat(), index: _log_index };
}

function Log_dump(url) { // @arg String(= ""): "" or url(http://example.com?log=@@)
                         // @help: Log.dump
                         // @desc: dump log
    function _stamp(db) {
        return new Date(db.time).format(db.type & 4 ? "[D h:m:s ms]:" : "[I]:");
    }

    var db = _log_db, i = _log_index, iz = db.length,
        console = global.console,
        //space = mm.env.webkit ? "  " : "";
        space = "  ";

    if (!url) {
        if (console) {
            for (; i < iz; ++i) {
                switch (db[i].type) {
                case 0: console.log( space + _stamp(db[i]) + db[i].msg); break;
                case 1: console.warn(space + _stamp(db[i]) + db[i].msg); break;
                case 2: console.error(       _stamp(db[i]) + db[i].msg); break;
                case 4: console.log( space + _stamp(db[i]) + db[i].msg);
                case 6: console.error(       _stamp(db[i]) + db[i].msg); break;
                }
            }
        }
    } else if (url.indexOf("http") === 0) {
        if (global.Image) {
            for (; i < iz; ++i) {
              //(new Image).src = url.at(db[i].msg);
                (new Image).src = url.repace(/@@/, db[i].msg);
            }
        }
    }
    _log_index = i;
}

function Log_warn(ooo) { // @var_args Mix: message
                            // @help: Log.warn
                            // @desc: push log db
    _log_db.push({
        type: 1,
        time: Date.now(),
        msg:  [].slice.call(arguments).join(" ")
    });
    _log_db.length > _log_limit && Log_dump();
}

function Log_error(ooo) { // @var_args Mix: message
                          // @help: Log.error
                          // @desc: push log db
    _log_db.push({
        type: 2,
        time: Date.now(),
        msg:  [].slice.call(arguments).join(" ")
    });
    _log_db.length > _log_limit && Log_dump();
}

function Log_clear() { // @help: Log.clear
                       // @desc: clear log db
    _log_index = 0;
    _log_db = [];
}

// --- LogGroup ---
function LogGroup_log(ooo) {
    _log_db.push({
        type: this._mode,
        time: Date.now(),
        msg:  this._raw(2, [].slice.call(arguments).join(" "))
    });
}

function LogGroup_error(ooo) {
    _log_db.push({
        type: this._mode + 2,
        time: Date.now(),
        msg:  this._raw(2, [].slice.call(arguments).join(" "))
    });
}

function LogGroup_out() {
    _log_db.push({
        type: this._mode,
        time: Date.now(),
        msg:  this._raw(3, (new Date).diff(now))
    });
    --_log_nest;
    _log_db.length > _log_limit && Log.dump();
}

function LogGroup_raw(index, msg) {
    return _repeat(_parts[0], this._nest) +
           _parts[index] + " " + label + "( " + msg + " )";
}

function _nickname(fn) { // copy from Function#nickname
    var name = fn.name || (fn + "").split("\x28")[0].trim().slice(9);

    return name ? name.replace(/^mm_/, "mm.") : "";
}

function _repeat(chr, count) { // copy from String#repeat
    count = count | 0;
    return (chr.length && count > 0) ? Array(count + 1).join(chr) : "";
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Log: Log };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Log = Log;

})(this.self || global);
//}@log

