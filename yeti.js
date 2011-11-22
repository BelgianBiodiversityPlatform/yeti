;(function(ns) {

    var Yeti = ns.Yeti = new Object();

    /***********************************************************************
        XMLHttpRequest
    ************************************************************************/

    Yeti.XMLHttpRequest = function() {
        if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        } else if (window.ActiveXObject) {
            return new window.ActiveXObject('Microsoft.XMLHTTP');
        } else {
            return null;
        }
    }

    /***********************************************************************
        DOM
    ************************************************************************/

    Yeti.DOM = new Object();

    /* return a reference to the first child node of that element which is of
     * nodeType 1.
     */

    Yeti.DOM.firstElementChild = function(elem) {
        return elem.firstElementChild ?
        elem.firstElementChild :
        (function(elem) {
            for (var i=0, len=elem.childNodes.length; i<len; i++) {
                if (elem.childNodes[i].nodeType === 1) {
                    return elem.childNodes[i];
                }
            }
            return null;
        })(elem);
    }

})(window);
