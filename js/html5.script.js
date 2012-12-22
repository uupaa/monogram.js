// html5.script.js

//{@script
(function() {

// --- header ----------------------------------------------
function Script() {
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "Script" });
}
Script.run = Script_run;

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Script_run(expression) { // @arg String: JavaScript Expression
                                  // @desc: blocking api
    var script = document.createElement("script"),
        head = document.head ||
               document.getElementsByTagName("head")[0];

    head.appendChild(script);

    script.charset = "utf-8";
    script.text = expression;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Script: Script };
} else {
    global.Script = Script;
}

})(this.self || global);
//}@script

/*
    var Script = require("./html5.script").Script;

    Script.run("alert(123)");
 */
