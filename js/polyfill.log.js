// polyfill.log.js: log

//{@log
(function(global) {

global.console || (global.console = {});
global.console.log   || (global.console.log = nop);
global.console.info  || (global.console.info = nop);
global.console.warn  || (global.console.warn = nop);
global.console.debug || (global.console.debug = nop);
global.console.error || (global.console.error = nop);
global.console.asset || (global.console.asset = nop);
global.console.trace || (global.console.trace = nop);
global.console.group || (global.console.group = nop);
global.console.groupEnd || (global.console.groupEnd = nop);

// --- header ----------------------------------------------

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function nop() {
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------

})(this.self || global);
//}@log

