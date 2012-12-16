// html5.eval.js

/*
    require("html5.eval");

    "alert(123)".evalJavaScript();
 */

//{@evaljavascript
(function() {

// --- header ----------------------------------------------
String.prototype.evalJavaScript ||
    Object.defineProperty(String.prototype, "evalJavaScript", {
        configurable: true, writable: true, value: String_evalJavaScript
    });

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function String_evalJavaScript() { // @arg String: JavaScript Expression
                                   // @desc: blocking api
    var expression = this + "",
        script = document.createElement("script"),
        head = document.head ||
               document.getElementsByTagName("head")[0];

    head.appendChild(script);
    script.charset = "utf-8";
    script.text = expression;
}

})();
//}@evaljavascript
