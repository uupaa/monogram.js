// mm.event.js

/*
    document:
        http://code.google.com/p/mofmof-js/wiki/BaseAPI

    available compile option:
        node mm.js

    need modules:
        none
 */

//{@event

mm.event || (function(global, document) {

function _api() {
    mm.event = {};

    mm.mix(Element.prototype, {
        bind:   bind,       // document.body.bind("click", function(evt) { ... });
        unbind: unbind      // document.body.unbind("click", function(evt) { ... });
    });
}

// --- local vars ---
// none

// --- impl ---

function bind(eventType, fn) {
    if (this["_on" + eventType]) {
        alert("already bound: " + this + ", " + eventType);
    }
    this["_on" + eventType] = [eventType, fn];
    this.addEventListener(eventType, fn);
}

function unbind() {
    var ary = this["_on" + eventType];

    if (ary) {
        this.removeEventListener(ary[0], ary[1]);
        delete this["_on" + eventType];
    }
}


// --- build and export ---
_api();

})(this, this.document);
//}@event
