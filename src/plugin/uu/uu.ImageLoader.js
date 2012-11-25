(function() {

uu.ImageLoader = uu_ImageLoader;

// uu.ImageLoader
function uu_ImageLoader(url,     // @arg URLString: url
                        param,   // @arg Await/Object(= undefined): { onload, onerror }
                        index) { // @arg Number(= Date.now): optional index
                                 //      index.onload - Function: onload callback
                                 //      index.onerror - Function: onerror callback
                                 // @help: uu.ImageLoader
                                 // @desc: Image loader
    param = param || {};

    var node = new Image,
        isAwait = mm.type(param) === "Await";

//  this.node = node;

    // set node.index
    node.index = index === void 0 ? Date.now()
                                  : index;

    node.onload = function() {
        isAwait ? param.pass(node)
                : (param.onload && param.onload({ node: node, param: param }));
    };
    node.onerror = function() {
        isAwait ? param.miss(node)
                : (param.onerror && param.onerror({ node: node, param: param }));
    };
    node.src = url;
}

})();
