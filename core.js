;(function(ns) {

    var Yeti = ns.Yeti = new Object();

    Yeti.Element = function(src) {
        if (typeof(src) === 'string') {
            return document.getElementById(src);
        } else {
            return src;
        }
    }

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

    /* Yeti.DOM.importNode
     * Creates a copy of a node from an external document that can be
     * inserted into the current document.
     */

    Yeti.DOM.importNode = function(node, deep) {
        if (deep === undefined) {
            deep = true;
        }

        return doucment.importNode ?
        document.importNode(node, deep) :
        (function(node, deep) {

            /* Returns an integer code representing the type of the node. */
            var NodeTypes = {
                ELEMENT_NODE : 1,
                ATTRIBUTE_NODE : 2,
                TEXT_NODE : 3,
                CDATA_SECTION_NODE : 4,
                ENTITY_REFERENCE_NODE : 5,
                ENTITY_NODE : 6,
                PROCESSING_INSTRUCTION_NODE : 7,
                COMMENT_NODE : 8,
                DOCUMENT_NODE : 9,
                DOCUMENT_TYPE_NODE : 10,
                DOCUMENT_FRAGMENT_NODE : 11,
                NOTATION_NODE : 12
            }

            switch (node.nodeType) {
                case NodeTypes.ELEMENT_NODE:
                    var newNode = document.createElement(node.nodeName);

                    if (node.attributes && node.attributes.length > 0) {
                        for (var i=0, _len=node.attributes.length ; i<_len ; i++) {
                            var attr_name = node.attributes[i].nodeName,
                                attr_value = node.getAttribute(attr_name)
                            ;

                            if (attr_name.toLowerCase() == 'style') {
                                newNode.style.cssText = attr_value;
                            } else if (attr_name.toLowerCase() == 'class') {
                                newNode.className = attr_value;
                            } else if (attr_name.slice(0,2) == 'on') {
                                // FIXME: slow...
                                newNode[attr_name] = new Function(attr_value);
                            } else {
                                newNode.setAttribute(attr_name, attr_value);
                            }
                        }
                    }

                    if (deep && node.childNodes && node.childNodes.length > 0) {
                        for (var i=0, _len=node.childNodes.length ; i<_len ; i++) {
                            newNode.appendChild(Yeti.DOM.importNode(node.childNodes[i], deep));
                        }
                    }

                    return newNode;
                    break;

                case NodeTypes.TEXT_NODE:
                    return document.createTextNode(node.nodeValue);
                    break;

                case NodeTypes.CDATA_SECTION_NODE:
                    return document.createCDATASection(node.nodeValue);
                    break;

                case NodeTypes.COMMENT_NODE:
                    return document.createComment(node.nodeValue);
                    break;

        })(node, deep);
    }

    /* Yeti.DOM.firstElementChild
     * Returns a reference to the first child node of that element which is of
     * nodeType 1.
     */

    Yeti.DOM.firstElementChild = function(elem) {
        return elem.firstElementChild ?
        elem.firstElementChild :
        (function(elem) {
            for (var i=0, _len=elem.childNodes.length; i<_len; i++) {
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

    /* Yeti.DOM.removeNodes
     * Removes all child nodes from an element.
     */

    Yeti.DOM.removeNodes = function(elem) {
        var removed = 0;

        while(elem.hasChildNodes()) {
            elem.removeChild(elem.lastChild);
            removed++;
        }

        return removed;
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

    /* Yeti.Tools.text_proto_str
     * Returns a detailed text of the constructor
     */

    Yeti.Tools.proto_str = function(obj) {
        return Object().toString.call(obj);
    }


})(window);
