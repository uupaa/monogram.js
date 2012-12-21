(function(global) {

mm.api.ver1 = {
    hoge: mm_hoge_ver1
};

function mm_hoge_ver1() {
    console.log("mm.hoge.ver1");
}

Object.defineProperty(String.prototype, "ver1", { value: String_ver1 });
Object.defineProperty(Array.prototype,  "ver1", { value: Array_ver1 });


function String_ver1(that) {
    // --- header ---
    return {
        has: String_has_ver1
    };
    // --- implement ---
    function String_has_ver1(find) {
        return false;
    }
}

function Array_ver1(that) {
    // --- header ---
    return {
        has: Array_has_ver1
    };
    // --- implement ---
    function Array_has_ver1(find) {
        return false;
    }
}

})(this.self || global);
