// dev.perf.js: Performance API

//{@perf
(function(global) {

// --- header ----------------------------------------------
function Perf() {
}
Perf.name = "Perf";
Perf.prototype = {
    constructor:Perf,
    calc:       calc         // Perf#calc():Object
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function calc() { // @ret Object: { processing, redirect, appcache,
                  //                dns, dom, load, fetch }
                  //       processing - Number: Processing time
                  //       redirect - Number: redirect elapsed
                  //       appcache - Number: Application cache elapsed
                  //       dns      - Number: DomainLookup elapsed
                  //       dom      - Number: DOMContentLoaded event elapsed
                  //       load     - Number: window.load event elapsed
                  //       fetch    - Number: fetchStart to window.load event finished
                  // @help: Perf#calc
                  // @desc: calc performance data

    var tm = (global.performance || 0).timing || 0;

    if (!tm) {
        return { processing: 0, redirect: 0, appcache: 0,
                 dns: 0, dom: 0, load: 0, fetch: 0 };
    }
    return {
        processing: tm.loadEventStart - tm.responseEnd,
        redirect:   tm.redirectEnd - tm.redirectStart,
        appcache:   tm.domainLookupStart - tm.fetchStart,
        dns:        tm.domainLookupEnd - tm.domainLookupStart,
        dom:        tm.domContentLoadedEventEnd - tm.domContentLoadedEventStart,
        load:       tm.loadEventEnd - tm.loadEventStart,
        fetch:      tm.loadEventEnd - tm.fetchStart
    };
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------

})(this.self || global);
//}@perf

