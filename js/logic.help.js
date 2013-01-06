// logic.help.js: function help

//{@help
(function(global) {

// --- header ----------------------------------------------
function Help(that) { // @arg Function:
                      // @ret String:
    return that.help();
}
Help.name = "Help";

Object.defineProperty(Function.prototype, "help", {
    value: help      // fn#help(that:Object = null):String
});
help.add = help_add; // fn#help.add(url:URLString, word:String/StringArray/RegExp):void
help.url = help_url; // fn#help.url(fn:Function):String

// --- library scope vars ----------------------------------
var _help_db = [];

// --- implement -------------------------------------------
function help(that) { // @arg this:
                      // @ret String:
                      // @help: Function#help
                      // @desc: show help url
    that = that || this;
    var url = help_url(that),
        src = that.__SRC__ ? that.__SRC__ : that;

    return url + "\n\n" + that + "\n\n" + url;
}

function help_url(fn) { // @arg Function/undefined:
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

function help_add(url,    // @arg URLString: help url string
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

// --- build -----------------------------------------------
help.add("http://code.google.com/p/mofmof-js/wiki/",
         ("Object,Array,String,Boolean,Number,Date,RegExp,Function," +
          "mm,Class,Hash,Await,Msg,UID,Help,Env,Script," +
          "Base64,SHA1,MD5,HMAC,UTF16,CRC32").split(","));

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Help: Help };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Help = Help;

})(this.self || global);
//}@help

