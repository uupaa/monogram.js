// html5.script.js: eval JavaScript

(function(global) {

// --- header ----------------------------------------------
function Script() {}
Script.load = Script_load;  // load(src:String, fn:Function = null)
Script.run  = Script_run;   // run(expression:String)

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Script_load(src,  // @arg String: JavaScript source
                     fn) { // @arg Function(= null): fn(err: Error)
    var script = document.createElement("script"),
        head = document.head ||
               document.getElementsByTagName("head")[0];

    script.onload = function() {
        fn && fn(null);
    };
    script.onerror = function() {
        fn && fn(new TypeError("Bad Request"));
    };
    script.charset = "utf-8";
    script.src = src;
    head.appendChild(script);
}

function Script_run(expression) { // @arg String: JavaScript Expression
                                  // @desc: blocking api
    var script = document.createElement("script"),
        head = document.head ||
               document.getElementsByTagName("head")[0];

    script.charset = "utf-8";
    script.text = expression;
    head.appendChild(script);
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Script: Script };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Script = Script;

})(this.self || global);

