// html5.script.js: eval JavaScript

//{@script
(function(global) {

// --- header ----------------------------------------------
function Script() {
}
Script.load = Script_load;  // load(src:String, fn:Function = null)
Script.run  = Script_run;   // run(expression:String, fn:Function = null)

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Script_load(src,  // @arg String: JavaScript source
                     fn) { // @arg Function(= null): fn(err: Error)
    var script = document.createElement("script");

    script.onload = function() {
        fn && fn(null); // ok
    };
    script.onerror = function() {
        fn && fn( new TypeError("Bad Request") );
    };
    script.charset = "utf-8";
    script.src = src;
    (document.head || _headTag()).appendChild(script);
}

function Script_run(expression, // @arg String: JavaScript Expression
                    fn) {       // @arg Function(= null): fn(err: Error)
                                // @desc: blocking api
    var script = document.createElement("script");

    script.charset = "utf-8";
    script.text = expression;
    (document.head || _headTag()).appendChild(script);
    fn && fn(null); // ok
}

function _headTag() {
    return document.getElementsByTagName("head")[0] || document.body;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Script: Script };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Script = Script;

})(this.self || global);
//}@script

/*
    var Script = require("./html5.script").Script;

    Script.run("alert(123)");
 */
