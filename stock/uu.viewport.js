// mm.viewport.js

/*
    document:
        http://code.google.com/p/mofmof-js/wiki/BaseAPI

    available compile option:
        node mm.js

    need modules:
        none
 */

//{@viewport

mm.viewport || (function(global, document) {

function _defineLibraryAPIs() {
    mm.viewport = mm_viewport;
    mm.viewport.isPortrait = mm_viewport_isPortrait;
    mm.viewport.isLandscape = mm_viewport_isLandscape;
}

// --- local vars ---
// none

// --- impl ---
// mm_viewport
function mm_viewport() { // @return Hash: { innerWidth, innerHeight,
                         //                 pageXOffset, pageYOffset,
                         //                 orientation, devicePixelRatio }
                         //      innerWidth  - Number:
                         //      innerHeight - Number:
                         //      pageXOffset - Number:
                         //      pageYOffset - Number:
                         //      orientation - Number: last orientation
                         //      devicePixelRatio - Number: 1 is not Retina display
                         //                                 2 is iPhone4 Retina dispiay
                         //            0 is Portrait
                         //          -90 is Landscape
                         //           90 is Landscape
                         //          180 is Portrait
//{@mb
    var undef;

/*
    if (mm.env.ie8) { // [IE6][IE7][IE8] CSSOM View Module
        return { innerWidth:  htmlNode.clientWidth,  // [IE9] supported
                 innerHeight: htmlNode.clientHeight, // [IE9] supported
                 pageXOffset: htmlNode.scrollLeft,   // [IE9] supported
                 pageYOffset: htmlNode.scrollTop,    // [IE9] supported
                 orientation: 0,                     // [WebKit/iPhone/Android] only
                 devicePixelRatio: 1 };              // [WebKit/iPhone/Android] only
    }
 */
/*
    global.orientation === undef && (global.orientation = 0);
    global.devicePixelRatio === undef && (global.devicePixelRatio = 1);
 */
//}@mb
    global.orientation === undef && (global.orientation = 0);
    global.devicePixelRatio === undef && (global.devicePixelRatio = 1);

    return {
        x: global.pageXOffset,
        y: global.pageYOffset,
        w: global.innerWidth,
        h: global.innerHeight,
        dpr: devicePixelRatio,
        o: global.orientation,
        orientation: global.orientation,
    };
}

function mm_viewport_isPortrait() {
    return global.orientation === 0 || global.orientation === 180;
}

function mm_viewport_isLandscape() {
    return global.orientation === 90 || global.orientation === -90;
}

// --- build and export ---
_defineLibraryAPIs();

})(this, this.document);
//}@viewport
