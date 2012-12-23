// logic.url.js: URL build, parse and resolver

//{@url
(function(global) {

// --- header ----------------------------------------------
function URL(url) { // @arg URLObject/URLString(= ""):
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "URL" });

    return !url ? URL_parse(global.location.href)
                : typeof url === "string" ? URL_parse(url)
                                          : URL_build(url);
}

URL.build       = URL_build;        // URL.build(URLObject):URLString
URL.parse       = URL_parse;        // URL.parse(url:URLString):URLObject
URL.isURL       = URL_isURL;        // URL.isURL(url:String, isRelative:Boolean = false):Boolean
URL.resolve     = URL_resolve;      // URL.resolve(url:URLString = ""):URLString
URL.normalize   = URL_normalize;    // URL.normalize(url:URLString):URLString
URL.buildQuery  = URL_buildQuery;   // URL.buildQuery(obj:URL, joint:String = "&"):URLQueryString
URL.parseQuery  = URL_parseQuery;   // URL.parseQuery(query:URLString/URLQueryString):URLQueryObject
URL.FILE        = /^(file:)\/{2,3}(?:localhost)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/i;
                  //                 localhost    /dir/f.ext ?key=value    #hash
                  //  [1]                         [2]        [3]          [4]
URL.URL         = /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ :?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                  //  https://    user:pass@    server   :port    /dir/f.ext   ?key=value     #hash
                  //  [1]         [3]           [4]       [5]     [6]         [7]            [8]
URL.PATH        = /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                  //  /dir/f.ext   key=value    hash
                  //  [1]          [2]          [3]

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function URL_build(obj) { // @arg URLObject: { protocol, host, pathname, search, fragment }
                          // @ret URLString: "{protocol}//{host}{pathname}?{search}#{fragment}"
                          // @desc: build URL
    return [obj.protocol,
            obj.protocol ? (obj.protocol === "file:" ? "///" : "//") : "",
            obj.host     || "", obj.pathname || "/",
            obj.search   || "", obj.fragment || ""].join("");
}

function URL_parse(url) { // @arg URLString: absolute url or relative url
                          // @ret URLObject: { href, ... fragment, ok }
                          // @desc: parse URL
    // href     - String:  "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment"
    // protocol - String:  "http:"
    // scheme   - String:  "http:"
    // secure   - Boolean: false
    // host     - String:  "user:pass@example.com:8080". has auth
    // auth     - String:  "user:pass"
    // hostname - String:  "example.com"
    // port     - Number:  8080
    // pathname - String:  "/dir1/dir2/file.ext"
    // dir      - String:  "/dir1/dir2"
    // file     - String:  "file.ext"
    // search   - String:  "?a=b&c=d"
    // query    - URLQueryObject: { a: "b", c: "d" }
    // fragment - String:  "#fragment"
    // ok       - Boolean: true is valid url

    function _set(obj) { // @arg URLObject:
                         // @ret URLObject:
        var ary = obj.pathname.split("/");

        obj.href       = obj.href     || "";
        obj.protocol   = obj.protocol || "";
        obj.scheme     = obj.protocol;        // [alias]
        obj.secure     = obj.secure   || false;
        obj.host       = obj.host     || "";
        obj.auth       = obj.auth     || "";
        obj.hostname   = obj.hostname || "";
        obj.port       = obj.port     || 0;
        obj.pathname   = obj.pathname || "";
        obj.file       = ary.pop();
        obj.dir        = ary.join("/") + "/";
        obj.search     = obj.search   || "";
        obj.query      = URL_parseQuery(obj.search);
        obj.fragment   = obj.fragment || "";
        obj.ok         = obj.ok       || true;
        return obj;
    }

    var m, ports = { "http:": 80, "https": 443, "ws:": 81, "wss:": 816 };

    m = URL.FILE.exec(url);
    if (m) {
        return _set({ href:     url,
                      protocol: m[1], pathname: m[2],
                      search:   m[3], fragment: m[4] });
    }
    m = URL.URL.exec(url);
    if (m) {
        return _set({ href:     url,
                      protocol: m[1],
                      secure:   m[1] === "https:" || m[1] === "wss:",
                      host:     m[2], auth:   m[3],
                      hostname: m[4], port:   m[5] ? +m[5] : (ports[m[1]] || 0),
                      pathname: m[6], search: m[7],
                      fragment: m[8] });
    }
    m = URL.PATH.exec(url);
    if (m) {
        return _set({ href:     url,
                      pathname: m[1], search: m[2], fragment: m[3] });
    }
    return _set({ href: url, pathname: url, ok: false });
}

function URL_isURL(url,          // @arg String:
                   isRelative) { // @arg Boolean(= false):
                                 // @ret Boolean: true is absolute/relative url
                                 // @desc: is absolute url or relative url
                                 // @help: URL.isURL
    if (isRelative) {
        return URL.URL.test("http://a.a/" + url.replace(/^\/+/, ""));
    }
    return /^(https?|wss?):/.test(url) ? URL.URL.test(url)
                                       : URL.FILE.test(url);
}

function URL_resolve(url) { // @arg URLString(= ""): relative URL or absolute URL
                            // @ret URLString: absolute URL
                            // @desc: convert relative URL to absolute URL
                            // @help: URL.resolve
    url = url || global.location.href;

    if (/^(https?|file|wss?):/.test(url)) { // is absolute url?
        return url;
    }
    var a = global.document.createElement("a");

    a.setAttribute("href", url);    // <a href="hoge.htm">
    return a.cloneNode(false).href; // -> "http://example.com/hoge.htm"
}

function URL_normalize(url) { // @arg URLString:
                              // @ret URLString:
                              // @help: URL.normalize
                              // @desc: path normalize
    var rv = [], path,
        obj = URL_parse(url),
        dots = /^\.+$/,
        dirs = obj.dir.split("/"),
        i = 0, iz = dirs.length;

    // normalize("dir/.../a.file") -> "/dir/a.file"
    // normalize("../../../../a.file") -> "/a.file"
    for (; i < iz; ++i) {
        path = dirs[i];
        if (path === "..") {
            rv.pop();
        } else if (!dots.test(path)) {
            rv.push(path);
        }
    }
    // tidy slash "///" -> "/"
    obj.pathname = ("/" + rv.join("/") + "/").replace(/\/+/g, "/") + obj.file;
    return URL_build(obj); // rebuild
}

function URL_buildQuery(obj,     // @arg URLQueryObject: { key1: "a", key2: "b", key3: [0, 1] }
                        joint) { // @arg String(= "&"): joint string "&" or "&amp;" or ";"
                                 // @ret URLQueryString: "key1=a&key2=b&key3=0&key3=1"
                                 // @help: URL.buileQuery
                                 // @desc: build query string
    joint = joint || "&";

    var rv = [], token = [], i = 0, iz = 0, key, encKey, value;

    for (key in obj) {
        encKey = global.encodeURIComponent(key);
        value = obj[key];

        if (!Array.isArray(value)) {
            value = [value];
        }
        // "key3=0&key3=1"
        for (token = [], i = 0, iz = value.length; i < iz; ++i) {
            token.push( enckey + "=" + global.encodeURIComponent(value[i]) );
        }
        rv.push( token.join(joint) );
    }
    return rv.join(joint); // "key1=a&key2=b&key3=0&key3=1"
}

function URL_parseQuery(query) { // @arg URLString/URLQueryString: "key1=a;key2=b;key3=0;key3=1"
                                 // @ret URLQueryObject: { key1: "a", key2: "b", key3: ["0", "1"] }
                                 // @help: URL.parseQuery
                                 // @desc: parse query string
    function _parseQuery(_, key, value) {
        var k = global.encodeURIComponent(key),
            v = global.encodeURIComponent(value);

        if (rv[k]) {
            if (Array.isArray(rv[k])) {
                rv[k].push(v);
            } else {
                rv[k] = [rv[k], v];
            }
        } else {
            rv[k] = v;
        }
        return "";
    }

    var rv = {};

    if (query.indexOf("?") >= 0) {
        query = query.split("?")[1].split("#")[0];
    }
    query.replace(/&amp;|&|;/g, ";"). // "&amp;" or "&" or ";" -> ";"
          replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parseQuery);

    return rv;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { URL: URL } };
} else {
    global.Monogram || (global.Monogram = {});
    global.Monogram.URL = URL;
}

})(this.self || global);
//}@url

/*
    var URL = require("./logic.url").Monogram.URL;

    function test1() { // parse and build
        var absurl = "http://example.com/dir/file.exe?key=value#hash";
        var urlObject1 = URL(absurl); // parse
        var urlObject2 = URL.parse(absurl); // parse

        var result1 = URL.build(urlObject1) === absurl; // build
        var result2 = URL.build(urlObject2) === absurl; // build

        if (result1 && result2) {
            console.log("true");
        } else {
            console.log("false");
        }
    }

    function test2() { // isURL
        var url = "http://example.com";

        if ( URL.isURL(url) === true) {
            console.log("true");
        } else {
            console.log("false");
        }
    }

    function test3() { // normalize
        var url = "http://example.com///..//hoge/....//huga.ext";

        console.log( URL.normalize(url) );
    }

    function test4() { // parse and build QueryString
        var url = "http://example.com?key1=a;key2=b;key3=0;key3=1";

        var urlQueryObject = URL.parseQuery(url);

        var result = JSON.stringify( urlQueryObject );

        console.log( result === '{"key1":"a","key2":"b","key3":["0","1"]}' );
    }
 */

