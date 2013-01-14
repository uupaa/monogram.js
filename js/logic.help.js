// logic.help.js: function help

//{@help
(function(global) {

// --- header ----------------------------------------------
function Help(that) { // @arg Function:
                      // @ret String:
    return that.help();
}
Help.name = "Help";
Help.add = Help_add; // fn#help.add(url:URLString, rex:String/StringArray/RegExp):void
Help.url = Help_url; // fn#help.url(fn:Function):String

if (!Object.defineProperty) {
    Function.prototype.help = help;
} else {
    Object.defineProperty(Function.prototype, "help", {
        value: Help_help  // fn#help(that:Object = null):String
    });
}

// --- library scope vars ----------------------------------
var _help_db = []; // { url, rex }

// --- implement -------------------------------------------
function Help_help(that) { // @arg this:
                           // @ret String:
                           // @help: Function#help
                           // @desc: show help url
    that = that || this;
    var url = Help_url(that);

    return url + "\n\n" + that + "\n\n" + url;
}

function Help_url(fn) { // @arg Function/undefined:
                        // @ret String:
                        // @desc: get help url
    var path,
        m = /@help:\s*([^ \n\*]+)\n?/.exec("\n" + fn + "\n");

    if (!m) {
        return "";
    }
    path = m[1].trim();

    return _help_db.map(function(obj) {
        var m = obj.rex.exec(path);

        return !m ? ""
             : m[2] === "#" ? obj.url + m[1] + "#" + m[1] + ".prototype." + m[3]
             : m[2] === "." ? obj.url + m[1] + "#" + m[1] + "."           + m[3]
                            : obj.url + m[1];
    }).join("");
}

function Help_add(url,   // @arg URLString: help url string
                  rex) { // @arg String/StringArray/RegExp: keywords or pattern
                          // @desc: add help chain
    if (typeof rex === "string") {
        rex = [rex];
    }
    if (Array.isArray(rex)) {
        //            ^(Type)(?:([#\.])([\w,]+))?$
        rex = RegExp("^(" + rex.join("|") + ")(?:([#\\.])([\\w,]+))?$");
    }
    _help_db.push({ url: url, rex: rex });
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

