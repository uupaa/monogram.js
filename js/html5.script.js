// html5.script.js: eval JavaScript

//{@script
(function(global) {

// --- header ----------------------------------------------
function Script() {
}
Script.run = Script_run;

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Script_run(expression) { // @arg String: JavaScript Expression
                                  // @desc: blocking api
    var script = document.createElement("script"),
        head = document.head ||
               document.getElementsByTagName("head")[0];

    script.charset = "utf-8";
    script.text = expression;
    head.appendChild(script);
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { Script: Script } };
} else {
    global.Monogram || (global.Monogram = {});
    global.Monogram.Script = Script;
}

})(this.self || global);
//}@script

/*
    var Script = require("./html5.script").Monogram.Script;

    Script.run("alert(123)");
 */
