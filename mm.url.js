// mm.url.js: url helper API

//{@url
(function(global) { // @arg Global: window or global

// --- header ----------------------------------------------
function _defineLibraryAPIs() {
    mm.url = mm.mix(mm_url, {           // mm.url(url:URLObject/URLString = ""):URLString/URLObject
        resolve:    mm_url_resolve,     // mm.url.resolve(url:URLString):URLString
        normalize:  mm_url_normalize,   // mm.url.normalize(url:URLString):URLString
        buildQuery: mm_url_buildQuery,  // mm.url.buildQuery(obj:URLObject, joint:String = "&"):URLQueryString
        parseQuery: mm_url_parseQuery   // mm.url.parseQuery(query:URLString/URLQueryString):URLQueryObject
    });
    mm.wiz(String.prototype, {
        isURL:      String_isURL        // "".isURL(isRelative:Boolean = false):Boolean
    });
    mm.wiz(RegExp, {
        FILE:       /^(file:)\/{2,3}(?:localhost)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/i,
                    //                 localhost    /dir/f.ext ?key=value    #hash
                    //  [1]                         [2]        [3]          [4]
        URL:        /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ :?#]*)(?:(\?[^#]*))?(?:(#.*))?$/,
                    //  https://    user:pass@    server   :port    /dir/f.ext   ?key=value     #hash
                    //  [1]         [3]           [4]       [5]     [6]         [7]            [8]
        PATH:       /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/
                    //  /dir/f.ext   key=value    hash
                    //  [1]          [2]          [3]
    });
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function String_isURL(isRelative) { // @arg Boolean(= false):
                                    // @ret Boolean: true is absolute/relative url
                                    // @desc: is absolute url or relative url
                                    // @help: String#isURL
    if (isRelative) {
        return RegExp.URL.test("http://a.a/" + this.replace(/^\/+/, ""));
    }
    return /^(https?|wss?):/.test(this) ? RegExp.URL.test(this)
                                        : RegExp.FILE.test(this);
}

function mm_url(url) { // @arg URLObject/URLString(= ""): "https://..."
                       //      URLObject: { protocol, host, pathname, search, fragment }
                       // @ret URLString/URLObject:
                       // @desc: get current URL, parse URL, build URL
                       // @help: mm.url
   return !url ? global.location.href
         : typeof url === "string" ? _url_parse(url)
                                   : _url_build(url);
}

function _url_build(obj) { // @arg URLObject/Object: need { protocol, host, pathname, search, fragment }
                           // @ret URLString: "{protocol}//{host}{pathname}?{search}#{fragment}"
                           // @inner: build URL
    return [obj.protocol,
            obj.protocol ? (obj.protocol === "file:" ? "///" : "//") : "",
            obj.host     || "", obj.pathname || "/",
            obj.search   || "", obj.fragment || ""].join("");
}

function _url_parse(url) { // @arg URLString: abs or rel,
                           //                   "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b&c=d#fragment"
                           // @ret URLObject: { href, protocol, scheme, secure, host,
                           //                   auth, hostname, port, pathname, dir, file,
                           //                   search, query, fragment, ok }
                           //     href     - String:  "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment"
                           //     protocol - String:  "http:"
                           //     scheme   - String:  "http:"
                           //     secure   - Boolean: false
                           //     host     - String:  "user:pass@example.com:8080". has auth
                           //     auth     - String:  "user:pass"
                           //     hostname - String:  "example.com"
                           //     port     - Number:  8080
                           //     pathname - String:  "/dir1/dir2/file.ext"
                           //     dir      - String:  "/dir1/dir2"
                           //     file     - String:  "file.ext"
                           //     search   - String:  "?a=b&c=d"
                           //     query    - URLQueryObject: { a: "b", c: "d" }
                           //     fragment - String:  "#fragment"
                           //     ok       - Boolean: true is valid url
                           // @inner: parse URL

    function _extends(obj) { // @arg URLObject:
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
        obj.query      = mm_url_parseQuery(obj.search);
        obj.fragment   = obj.fragment || "";
        obj.ok         = obj.ok       || true;
        return obj;
    }

    var m, ports = { "http:": 80, "https": 443, "ws:": 81, "wss:": 816 };

    m = RegExp.FILE.exec(url);
    if (m) {
        return _extends({
            href: url, protocol: m[1], pathname: m[2],
                       search:   m[3], fragment: m[4] });
    }
    m = RegExp.URL.exec(url);
    if (m) {
        return _extends({
            href: url, protocol: m[1],
                       secure:   m[1] === "https:" || m[1] === "wss:",
                       host:     m[2], auth:   m[3],
                       hostname: m[4], port:   m[5] ? +m[5] : (ports[m[1]] || 0),
                       pathname: m[6], search: m[7],
                       fragment: m[8] });
    }
    m = RegExp.PATH.exec(url);
    if (m) {
        return _extends({
            href: url, pathname: m[1], search: m[2], fragment: m[3] });
    }
    return _extends({ href: url, pathname: url, ok: false });
}

function mm_url_resolve(url) { // @arg URLString: relative URL or absolute URL
                               // @ret URLString: absolute URL
                               // @desc: convert relative URL to absolute URL
                               // @help: mm.url.resolve
    if (/^(https?|file|wss?):/.test(url)) { // is absolute url?
        return url;
    }
    var a = global.document.createElement("a");

    a.setAttribute("href", url);    // <a href="hoge.htm">
    return a.cloneNode(false).href; // -> "http://example.com/hoge.htm"
}

function mm_url_normalize(url) { // @arg URLString:
                                 // @ret URLString:
                                 // @help: mm.url.normalize
                                 // @desc: path normalize
    var rv = [], path, obj = _url_parse(url),
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
    return _url_build(obj); // rebuild
}

function mm_url_buildQuery(obj,     // @arg URLQueryObject: { key1: "a", key2: "b", key3: [0, 1] }
                           joint) { // @arg String(= "&"): joint string "&" or "&amp;" or ";"
                                    // @ret URLQueryString: "key1=a&key2=b&key3=0&key3=1"
                                    // @help: mm.url.buileQuery
                                    // @desc: build query string
    joint = joint || "&";

    return mm.map(obj, function(value, key) {
        key = global.encodeURIComponent(key);

        return Array.toArray(value).map(function(v) {
            return key + "=" + global.encodeURIComponent(v); // "key3=0;key3=1"
        }).join(joint);
    }).join(joint); // "key1=a;key2=b;key3=0;key3=1"
}

function mm_url_parseQuery(query) { // @arg URLString/URLQueryString: "key1=a;key2=b;key3=0;key3=1"
                                    // @ret URLQueryObject: { key1: "a", key2: "b", key3: ["0", "1"] }
                                    // @help: mm.url.parseQuery
                                    // @desc: parse query string
    function _parse(_, key, value) {
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
          replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parse);

    return rv;
}

// --- export --------------------------------
_defineLibraryAPIs();

})(this.self || global);
//}@url

