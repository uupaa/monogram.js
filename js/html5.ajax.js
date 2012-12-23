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
    load        Ajax_load       // Ajax#load(url:String, param:Object, fn:Function):this
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
                   fn) {  // @arg Await/Function(= null): fn(err:Error, data:String/Base64String/Node, time:Integer)
                          //    fn.err - Error: error Object or null
                          //    fn.data - String/Base64String/Node:
                          //    fn.time - Integer: from Last-Modified header or current time
                          // @ret this:
                          // @desc: get remote data
    param = param || {};

    var type = param.type || "text";
    var xhr = new XMLHttpRequest();
    var isAwait = fn.ClassName === "Await";

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var text = xhr.responseText;
            var time = Date.now();

            // --- get Last-Modified header ---
            var lastModified = xhr.getResponseHeader("Last-Modified");
            if (lastModified) {
                time = Date.parse(lastModified);
            }

            switch (xhr.status) {
            case 200:
            case 201:
                // "image/base64" -> Base64String
                if (/base64$/i.test(type)) {
                    return isAwait ? fn.pass({ data: Base64.btoa(text, true),
                                               time: time })
                                   : fn(null, Base64.btoa(text, true), time);
                }
                // "text/node" -> <body>
                if (/node$/i.test(type)) {
                    var body = document.createElement("body");

                    body.innerHTML = text;
                    return isAwait ? fn.pass({ data: body, time: time })
                                   : fn(null, body, time);
                }
                // "text/js" -> eval(js)
                if (/js$/i.test(type)) {
                    Script.run(text);
                    return isAwait ? fn.pass({ data: "", time: time })
                                   : fn(null, "", time);
                }
                isAwait ? fn.pass({ data: text, time: time })
                        : fn(null, text, time);
                break;
            case 304:
            default:
                isAwait ? fn.miss({ data: new TypeError(xhr.status), time: time })
                        : fn(new TypeError(xhr.status), "", time);
            }
        }
    };
    xhr.open("GET", url, true);
    if (/^(binary|image)/i.test(type)) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.withCredentials = true;
    xhr.send(null);

    return this;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { Ajax: Ajax } };
} else {
    global.Monogram || (global.Monogram = {});
    global.Monogram.Ajax = Ajax;
}

})(this.self || global);
//}@ajax

/*
    var Ajax = require("./Ajax").Monogram.Ajax;

    new Ajax().load(url, { type: "text" }, function(err, result, time) {
    });
 */

