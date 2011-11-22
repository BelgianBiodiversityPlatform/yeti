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
        JSON
    ************************************************************************/

    Yeti.JSON = new Object();


    /***********************************************************************
        DOM
    ************************************************************************/

    Yeti.DOM = new Object();

    /* Yeti.DOM.firstElementChild
     * Returns a reference to the first child node of that element which is of
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

    /* Yeti.DOM.getElementsByClassName
     * Returns a set of elements which have all the given class names. 
     */

    Yeti.DOM.getElementsByClassName = function(name, src) {
        var src = src || document;

        return src.getElementsByClassName ?
        src.getElementsByClassName(name) :
        (function(name, src) {
            var class_pattern = new RegExp("(?:^|\\s)" + name + "(?:\\s|$)"),
                class_elems = [],
                selection = src.getElementsByTagName('*');

            for (var i=0, _len=selection.length; i<_len; i++) {
                if (class_pattern.test(selection[i].className)) {
                    class_elems.push(selection[i]);
                }
            }

            return class_elems;
        })(name, src);
    }

})(window);
