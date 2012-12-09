// polyfill.help.js: extend function help methods

//{@help
(function() {

// --- header ----------------------------------------------
function _extendNativeObjects() {
    wiz(Function.prototype, {
        help:   mix(Function_help, {    // fn#help(that:Object = null):String
            add:    Function_help_add,  // fn#help.add(url:URLString, word:String/StringArray/RegExp):void
            url:    Function_help_url   // fn#help.url(fn:Function):String
        })
    });
}

// --- library scope vars ----------------------------------
var _help_db = []; // [ <url, rex>, ... ]

// --- implement -------------------------------------------
function Function_help(that) { // @arg this:
                               // @ret String:
                               // @help: Function#help
                               // @desc: show help url
    that = that || this;
    var url = Function_help_url(that),
        src = that.__SRC__ ? that.__SRC__ : that;

    return url + "\n\n" + that + "\n\n" + url;
}

function Function_help_url(fn) { // @arg Function/undefined:
                                 // @ret String:
                                 // @desc: get help url
    var src  = fn.__SRC__ ? fn.__SRC__ : fn,
        help = /@help:\s*([^ \n\*]+)\n?/.exec("\n" + src + "\n");

    return help ? _findHelp(help[1].trim()) : "";
}

function _findHelp(help) {
    var ary = _help_db, i = 0, iz = ary.length, url, rex, m;

    for (; i < iz; i += 2) {
        url = ary[i];
        rex = ary[i + 1];
        m   = rex.exec(help);

        if (m) {
            return m[2] === "#" ? url + m[1] + "#" + m[1] + ".prototype." + m[3]
                 : m[2] === "." ? url + m[1] + "#" + m[1] + "."           + m[3]
                                : url + m[1];
        }
    }
    return "";
}

function Function_help_add(url,    // @arg URLString: help url string
                           word) { // @arg String/StringArray/RegExp: keywords or pattern
                                   // @desc: add help chain
    if (typeof word === "string") {
        word = [word];
    }
    if (Array.isArray(word)) {
        word = RegExp("^(" + word.join("|") + ")(?:([#\\.])([\\w\\,]+))?$");
    }
    _help_db.push(url, word);
}

function wiz(object, extend, override) {
    for (var key in extend) {
        (override || !(key in object)) && Object.defineProperty(object, key, {
            configurable: true, writable: true, value: extend[key]
        });
    }
}

// --- export --------------------------------
_extendNativeObjects();

})();
//}@help

