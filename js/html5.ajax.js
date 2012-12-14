// html5.ajax.js
// @need: mm.js, codec.base64.js, codec.utf.js, html5.eval.js

mm.Class("Ajax:Singleton", { // mm.iAjax
    load: function(url,   // @arg URLString:
                   param, // @arg Object: { type }
                          //    param.type - String(= "text"):
                          //        "binary", "binary/base64",
                          //        "image", "image/base64",
                          //        "text", "text/js", "text/node"
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
                        return isAwait ? fn.pass(text.toUTF16Array().toBase64String())
                                       : fn(null, text.toUTF16Array().toBase64String());
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
                        text.js();
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
        xhr.send(null);
    }
});

