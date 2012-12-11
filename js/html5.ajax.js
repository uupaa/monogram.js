// html5.ajax.js
// @need: mm.js, codec.base64.js, codec.utf.js

mm.Class("Ajax:Singleton", { // mm.iAjax
    load: function(url,   // @arg URLString:
                   param, // @arg Object: { type }
                          //    param.type - String: "binary", "binary/base64",
                          //                         "image",  "image/base64",
                          //                         "text",   "text/node"
                   fn) {  // @arg Function(= null): fn(err:Error, data:String/Base64String/Node)
                          //    fn.err - Error: error Object or null
                          //    fn.data - String/Base64String/Node:
                          // @desc: get remote data
        param = param || {};

        var type = param.type || "text";
            xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var text = xhr.responseText;

                switch (xhr.status) {
                case 200:
                case 201:
                    // binary -> Base64String
                    if (/base64/i.test(type)) {
                        return fn(null, text.toUTF16Array().toBase64String());
                    }
                    // text -> <body>
                    if (/node/i.test(type)) {
                        var body = document.createElement("body");

                        body.innerHTML = text;
                        return fn(null, body);
                    }
                    fn(null, text);
                    break;
                case 304:
                defaut:
                    fn(new TypeError(xhr.status), "");
                }
            }
        };
        xhr.open("GET", url, true);
        if (/binary|image/i.test(type)) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        }
        xhr.send(null);
    }
});

