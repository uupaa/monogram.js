// html5.eval.js
// @need: mm.js

//{@evaljs
(function() {

// --- header ----------------------------------------------
function _extendNativeObjects() {
    mm.wiz(String.prototype, {
        js:     String_js       // "".js():void
    });
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function String_js() { // @arg String: JavaScript Expression
                       // @desc: blocking api
    var expression = this + "",
        script = document.createElement("script"),
        head = document.head ||
               document.getElementsByTagName("head")[0];

    head.appendChild(script);
    script.charset = "utf-8";
    script.text = expression;
}

// --- export --------------------------------
_extendNativeObjects();

})();
//}@evaljs
