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

    /* Yeti.JSON.parse
     * Parses a string as JSON and returns the parsed value.
     */

    Yeti.JSON.parse = function(data) {
        return typeof JSON != 'undefined' ?
        JSON.parse(data) :
        (function(src) {
            // See RFC 4627
            var json = !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(src.replace(/"(\\.|[^"\\])*"/g, '')));
            return json ? eval('(' + json + ')') : null;
        })(data)
    }


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


    /***********************************************************************
        Tools
    ************************************************************************/

    Yeti.Tools = new Object();

    /* Yeti.Tools.Serializer
     * Serialize an object.
     */

    Yeti.Tools.Serializer = function(obj) {
        this.qs = [];

        for (var key in obj) {
            this._encodeValue(key, obj[key]);
        }
    }

    Yeti.Tools.Serializer.prototype.toString = function() {
        return this.qs.join('&');
    }

    Yeti.Tools.Serializer.prototype._encodeValue = function(key, value) {
        if (value !== undefined) {
            switch (value.constructor) {
                case Array:
                    this._encodeArray(key, value);
                    break;
                default:
                    this._encodeString(key, value);
                    break;
            }
        }
    }

    Yeti.Tools.Serializer.prototype._encodeArray = function(key, value) {
        for (var i=0, _len=value.length ; i<_len ; i++) {
            this._encodeValue(key, value[i]);
        }
    }

    Yeti.Tools.Serializer.prototype._encodeString = function(key, value) {
        this.qs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }


})(window);
