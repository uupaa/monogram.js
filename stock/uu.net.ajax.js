(function(global) { // @param GlobalObject: global or window

function _api(mix) {
    mm.net = mm.net || {};
    mm.net.ajax = mm_net_ajax;
}

// mm.net.ajax
function mm_net_ajax(url,   // @param URLString:
                     param, // @param Hash:
                     fn) {  // @param Function: callback(ok, lastModified, responseText)

    var xhr = new XMLHttpRequest;

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            switch (xhr.status) {
            case 200:
            case 201:
                fn(true, xhr.responseText);
                return;
            case 304:
                fn(false);
                return;
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.send(null);
}

// --- build and export api ---
_api(mm.mix);

})(this.self || global);

