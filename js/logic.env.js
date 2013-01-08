// logic.env.js

//{@env
(function(global) {

// --- header ----------------------------------------------
function Env() { // @help: Env
                 // @desc:
    _init(this);
}
Env.name = "Env";           // fn.constructor.name -> "UID"

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function _init(that) {
    var keys = _detect({
        ua:         "",                 // env#ua     - String: user agent
        lang:       "en",               // env#lang   - String: language. "en", "ja", ...
        secure:     false,              // env#secure - Boolean: is SSL page
        // --- browser ---
        ie:         false,              // env#ie     - Boolean: is IE
        ie8:        false,              // env#ie8    - Boolean: is IE 8
        ie9:        false,              // env#ie9    - Boolean: is IE 9
        ie10:       false,              // env#ie10   - Boolean: is IE 10
        ipad:       false,              // env#ipad   - Boolean: is iPad
        gecko:      !!global.netscape,  // env#gecko  - Boolean: is Gecko
        opera:      !!global.opera,     // env#opera  - Boolean: is Opera
        chrome:     false,              // env#chrome - Boolean: is Chrome, Chrome for Android, Chrome for iOS
        webkit:     false,              // env#webkit - Boolean: is WebKit
        safari:     false,              // env#safari - Boolean: is Safari, MobileSafari
        mobile:     false,              // env#mobile - Boolean: is Mobile device
        // --- run at ... ---
        node:       !!(global.require &&
                       global.process), // env#node   - Boolean: is node.js (run at Server)
        ngcore:     !!global.Core,      // env#ngcore - Boolean: is ngCore (run at ngCore)
        worker:     !!global.importScripts,
                                        // env#worker - Boolean: is WebWorkers (run at Worker)
        browser:    false,
        titanium:   !!global.Ti,        // env#titanium - Boolean: is Titanium (run at Titanium)

        // --- os ---
        ios:        false,              // env#ios    - Boolean: is iOS
        mac:        false,              // env#mac    - Boolean: is Mac OS X
        android:    false,              // env#android - Boolean: is Android
        windows:    false,              // env#windows - Boolean: is Windows
        // --- device ---
        touch:      false,              // env#touch  - Boolean: is Touch device
        retina:     false               // env#retina - Boolean: is Retina display. devicePixelRatio >= 2.0
    });

    for (var key in keys) {
        that[key] = keys[key];
    }

    // --- version ---
    that.version = {
        ie:         !that.ie      ? 0 : _ver("MSIE "),        // 10, 9
        ios:        !that.ios     ? 0 : _ver("OS "),          // 6, 5.1
        mac:        !that.mac     ? 0 : _ver("Mac OS X"),     // 10.6
        gecko:      !that.gecko   ? 0 : _ver("rv:"),          // 16, 15
        opera:      !that.opera   ? 0 : parseFloat(global.opera.version()),
        chrome:     !that.chrome  ? 0 : _ver("Chrome/"),      // 22
        webkit:     !that.webkit  ? 0 : _ver("AppleWebKit/"), // 537,4, 534
        safari:     !that.safari  ? 0 : _ver("Version/"),     // 6.0, 5.1
        android:    !that.android ? 0 : _ver("Android"),      // 4.1, 4.0, 2.3
        windows:    !that.windows ? 0 : _ver("Windows NT ")   // win8: 6.2, win7: 6.1, vista: 6, xp: 5.1
    };

    // --- vendor prefix ---
    // env#vendor.fn - String: vendor function prefix
    // env#vendor.css - String: vendor css prefix
    // env#vendor.style - String: vendor style property prefix
    that.vendor = that.webkit ? { fn: "webkit",css: "-webkit-",style: "webkit" }
                : that.gecko  ? { fn: "moz",   css: "-moz-",   style: "Moz"    }
                : that.opera  ? { fn: "o",     css: "-o-",     style: "O"      }
                : that.ie     ? { fn: "ms",    css: "-ms-",    style: "ms"     }
                              : { fn: "",      css: "",        style: ""       };

    function _ver(rex) {
        return parseFloat(that.ua.split(rex)[1].replace("_", ".")) || 1;
    }
}

// http://code.google.com/p/mofmof-js/wiki/UserAgentStrings
// http://googlewebmastercentral-ja.blogspot.com/2011/05/android.html
// http://blogs.msdn.com/b/ie/archive/2012/07/12/ie10-user-agent-string-update.aspx
function _detect(obj) { // @inner:
    if (obj.node || obj.ngcore || obj.worker || obj.titanium) {
        return obj;
    }
    obj.browser = true;

    var nav  = global.navigator,
        ua   = nav.userAgent,
        lang = nav.language || nav.browserLanguage || "";

    obj.ua       = ua;
    obj.lang     = lang.split("-", 1)[0]; // "en-us" -> "en"
    obj.secure   = global.location.protocol === "https:";
//{@ie
    if (obj.ie) {
        obj.ie8  = !!document.querySelector;
        obj.ie9  = !!global.getComputedStyle;
        obj.ie10 = !!global.msSetImmediate;
    }
//}@ie
    obj.ipad     = /iPad/.test(ua);
    obj.chrome   = /Chrome/.test(ua);
    obj.webkit   = /WebKit/.test(ua);
    obj.safari   = obj.webkit && !obj.chrome;
    obj.mobile   = /mobile/i.test(ua);
    obj.ios      = /iPhone|iPad|iPod/.test(ua);
    obj.mac      = /Mac/.test(ua);
    obj.android  = /android/i.test(ua);
    obj.windows  = /windows/i.test(ua);
    obj.touch    = obj.ios || obj.android || (obj.ie && /touch/.test(ua));
    obj.retina   = (global.devicePixelRatio || 1) >= 2;
    return obj;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Env: Env };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Env = Env;

})(this.self || global);
//}@env

/*
    var Env = require("./logic.env").Env;

    var env = new Env();

    console.log("env.node: " + env.node);
    console.log("env.ngcore: " + env.ngcore);
    console.log("env.worker: " + env.worker);
    console.log("env.browser: " + env.browser);
    console.log("env.titanium: " + env.titanium);
    console.log("env.version.safari: " + env.version.safari);
    console.log("env.version.chrome: " + env.version.chrome);
    console.log("env.version.ios: " + env.version.ios);
    console.log("env.version.android: " + env.version.android);
    console.log("env.vendor.fn: " + env.vendor.fn);
    console.log("env.vendor.css: " + env.vendor.css);
    console.log("env.vendor.style: " + env.vendor.style);
 */


