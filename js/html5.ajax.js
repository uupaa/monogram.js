// html5.ajax.js
// @need: codec.base64.js, html5.script.js

//{@ajax
(function(global) {

// --- header ----------------------------------------------
function Ajax() {
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "Ajax" });
}
Ajax.prototype = {
    load        Ajax_load       // Ajax#load(url:String, param:Object, fn:Function):void
};

// --- library scope vars ----------------------------------
//
// --- implement -------------------------------------------
function Ajax_load(url,   // @arg String:
                   param, // @arg Object: { type }
                          //    param.type - String(= "text"):
                          //        "binary"        -> load Binary to Binary
                          //        "binary/base64" -> load Binary to Base64String
                          //        "image"         -> load Binary to Binary
                          //        "image/base64"  -> load Binary to Base64String
                          //        "text"          -> load Text to Text
                          //        "text/js"       -> load Text to evvalJavaScript
                          //        "text/node"     -> load Text to HTMLFragment
                   fn) {  // @arg Await/Function(= null): fn(err:Error, data:String/Base64String/Node)
                          //    fn.err - Error: error Object or null
                          //    fn.data - String/Base64String/Node:
                          // @desc: get remote data
    param = param || {};

    var type = param.type || "text";
    var xhr = new XMLHttpRequest();
    var isAwait = fn.ClassName === "Await";

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var text = xhr.responseText;

            switch (xhr.status) {
            case 200:
            case 201:
                // "image/base64" -> Base64String
                if (/base64$/i.test(type)) {
                    return isAwait ? fn.pass(Base64.btoa(text, true))
                                   : fn(null, Base64.btoa(text, true));
                }
                // "text/node" -> <body>
                if (/node$/i.test(type)) {
                    var body = document.createElement("body");

                    body.innerHTML = text;
                    return isAwait ? fn.pass(body)
                                   : fn(null, body);
                }
                // "text/js" -> eval(js)
                if (/js$/i.test(type)) {
                    Script.run(text);
                    return isAwait ? fn.pass("")
                                   : fn(null, "");
                }
                isAwait ? fn.pass(text)
                        : fn(null, text);
                break;
            case 304:
            defaut:
                isAwait ? fn.miss(new TypeError(xhr.status))
                        : fn(new TypeError(xhr.status), "");
            }
        }
    };
    xhr.open("GET", url, true);
    if (/^(binary|image)/i.test(type)) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.withCredentials = true;
    xhr.send(null);
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Ajax: Ajax };
} else {
    global.Ajax = Ajax;
}

})(this.self || global);
//}@ajax
