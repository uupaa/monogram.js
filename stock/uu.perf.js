mm && (function(global) {

function _definePerformanceAPIs(mix, wiz) {

}

function _extendPerformanceAPIs(mix, wiz) {
    global.performance
    wiz(global
}

function Performance() {
    this.memory = new MemoryInfo;
    this.navigation = new PerformanceNavigation;
    this.timing = new PerformanceTiming;
}
function MemoryInfo() {
    this.jsHeapSizeLimit = 0;
    this.totalJSHeapSize = 0;
    this.usedJSHeapSize  = 0;
}
function PerformanceNavigation() {
    this.redirectCount = 0;
    this.type = 0;
}
function PerformanceTiming() {
    this.domainLookupEnd            = 0;
    this.domainLookupStart          = 0;
    this.connectStart               = 0;
    this.navigationStart            = 1;
    this.connectEnd                 = 2;
    this.fetchStart                 = 2;
    this.requestStart               = 2;
    this.responseStart              = 7;
    this.responseEnd                = 14;
    this.domLoading                 = 26;
    this.domInteractive             = 142;
    this.domContentLoadedEventStart = 142; // DOMContentLoaded Event fire
    this.domContentLoadedEventEnd   = 159; // DOMContentLoaded Evetn end
    this.domComplete                = 219; // document.readyState = "complete"
    this.loadEventStart             = 219; // window.onload Event fire
    this.loadEventEnd               = 226; // window.onload Event end
    this.redirectEnd                = 0;
    this.redirectStart              = 0;
    this.secureConnectionStart      = 0;
    this.unloadEventEnd             = 0;
    this.unloadEventStart           = 0;
}

_definePerformanceAPIs(mm.mix, mm.wiz);
_extendPerformanceAPIs(mm.mix, mm.wiz);

})(this.self || global);
