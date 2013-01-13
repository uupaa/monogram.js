// dev.log.js: log

//{@log
(function(global, wiz) {

function Log(lable,  // @arg String/Function: label (group name)
             mode) { // @arg Interger(= 0x0): 0x4 is perf mode
                     //     mode = 0x0 - normal
                     //     mode = 0x1 - warn
                     //     mode = 0x2 - error
    label = label.nickname ? label.nickname() : label;
    mode  = mode || 0;

    var now = Date.now(),
        nest = mm_logg.nest++,
        line = mm.env.lang === "ja" ? ["\u2502", "\u250c", "\u2502", "\u2514"]
                                    : ["|",      "+-",     "| ",     "`-"    ];

    _log_db.push({ type: mode, time: Date.now(), msg: _msg(1, "") });
    _logg.out   = _out;
    _logg.error = _error;
    return _logg;

    function _msg(index, msg) {
        return "@@@@ @@( @@ )".at(line[0].repeat(nest), line[index], label, msg);
    }
    function _error(ooo) {
        _log_db.push({ type: mode + 2, time: Date.now(),
                       msg:  _msg(2, [].slice.call(arguments).join(" ")) });
    }
    function _logg(ooo) {
        _log_db.push({ type: mode, time: Date.now(),
                       msg:  _msg(2, [].slice.call(arguments).join(" ")) });
    }
    function _out() {
        _log_db.push({ type: mode, time: Date.now(),
                       msg:  _msg(3, (new Date).diff(now)) });
        --mm_logg.nest;
        _log_db.length > mm_log.limit && mm_log_dump();
    }
}
Log.copy
Log.dump
Log.warn
Log.error
Log.clear

function Logg

        // --- log / log group ---
        log:    mixin(mm_log, {           // mm.log(...:Mix):void
            copy:   mm_log_copy,        // mm.log.copy():Object
            dump:   mm_log_dump,        // mm.log.dump(url:String = ""):void
            warn:   mm_log_warn,        // mm.log.warn(...:Mix):void
            error:  mm_log_error,       // mm.log.error(...:Mix):void
            clear:  mm_log_clear,       // mm.log.clear():void
            limit:  0                   // mm.log.limit - Integer: stock length
        }),
        logg:   mixin(mm_logg, {          // mm.logg(label:String/Function, mode:Integer = 0x0):Object
            nest:   0                   // mm.logg.nest - Number: nest level
        })
// --- header ----------------------------------------------

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function nop() {
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


