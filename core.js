/*
    Yeti, a simple Javascript library
*/

;(function(ns) {

    var Yeti = ns.Yeti = new Object();

    /* Simple URL cleaner */

    Yeti.url_for = function() {
        return Array.prototype.slice.call(arguments).join('/').replace(/\/{2,}/, '/');
    }

    /* Wrapper for document.getElementById */

    Yeti.Element = function(src) {
        if (typeof(src) === 'string') {
            return document.getElementById(src);
        } else {
            return src;
        }
    }


    /***********************************************************************
        Str
    ************************************************************************/

    Yeti.Str = new Object()

    /* Yeti.Str.trim
     * Returns the string stripped of whitespace from both ends.
     */

    Yeti.Str.trim = function(src) {
        return src.trim ?
        src.trim() :
        src.replace(/^\s+|\s+$/g,'');
    }

    /* Yeti.Str.reverse
     * Returns the string reversed.
     */

    Yeti.Str.reverse = function(src) {
        return src.split('').reverse().join('');
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
        AjaxRequest
    ************************************************************************/

    Yeti.AjaxRequest = function(url, opts) {
        var req = Yeti.XMLHttpRequest(),
            /* Request headers */
            headers = {
                'x-requested-with' : 'XMLHttpRequest'
            },

            /* Accept mapping */
            accepts = {
                json : 'application/json, text/json, text/javascript',
                html : 'text/html',
                xml : 'application/xml, text/xml',
                text : 'text/plain'
            },

            /* Default options */
            options = {
                method : 'GET',
                async : true,
                content_type : 'application/x-www-form-urlencoded',
                charset : 'UTF-8',
                data : null,
                cache : true,
                accept : undefined,
                headers : {},
                response_factory : Yeti.AjaxResponse
            }
        ; // var

        /* Override default options */
        for (var i in opts || {}) {
            options[i] = opts[i];
        }

        options.method = options.method.toUpperCase();

        if (options.method === 'POST') {
            headers['Content-Type'] = options.content_type +
                (options.charset ? '; charset=' + options.charset : '');
        }

        /* Serialize parameters to a query string and append it to the URL if
         * method is GET
         */
        if (options.data && typeof(options.data) !== 'string') {
            options.data = new Yeti.Tools.Serializer(options.data).toString();
            if (options.method === 'GET') {
                url += (url.indexOf('?') === -1 ? '?' : '&') + options.data;
            }
        }

        /* Append a timestamp to the url to avoid caching */
        if (!options.cache) {
            var __ts = '__ts=' + (new Date()).getTime();

            if (url.indexOf('__ts=') === -1) {
                url += (url.indexOf('?') === -1 ? '?' : '&') + __ts;
            } else {
                url = url.replace(/(:?__ts=\d+)/, __ts);
            }
        }

        req.onreadystatechange = function() {
            return options.onreadystatechange(new options.response_factory(this));
        }

        req.open(options.method, url, options.async)

        /* User-defined headers */
        for (var i in options.headers) {
            headers[i.toLowerCase()] = options.headers[i];
        }

        /* Ensure that the "Accept" header is properly set */
        if (!headers.accept) {
            headers.accept = accepts[options.accept] !== undefined ?
                             accepts[options.accept] : '*/*';
        }

        /* Set request headers */
        for (var i in headers) {
            req.setRequestHeader(i, headers[i]);
        }

        req.send(options.data)
    }


    /***********************************************************************
        AjaxResponse
    ************************************************************************/

    Yeti.AjaxResponse = function(req) {
        this.o = req;
        this.readyStates = ['uninitialized', 'loading', 'loaded',
                            'interactive', 'complete'];
    }

    Yeti.AjaxResponse.prototype.get_status = function() {
        var code = this.o.status;

        if ((code >= 200 && code < 300) || code == 304) {
            return 'ok';
        } else if (code >= 400 && code < 600) {
            return 'fail';
        } else {
            return 'unknown';
        }
    }

    Yeti.AjaxResponse.prototype.get_state = function() {
        return this.readyStates[this.o.readyState] || 'unknown';
    }

    Yeti.AjaxResponse.prototype.success = function() {
        return this.get_state() == 'complete' && this.get_status() == 'ok';
    }

    Yeti.AjaxResponse.prototype.error = function() {
        return this.get_state() == 'complete' && this.get_status() == 'fail';
    }


    /***********************************************************************
        JSON
    ************************************************************************/

    Yeti.JSON = new Object();

    /* Yeti.JSON.parse
     * Parses a string as JSON and returns the parsed value.
     */

    Yeti.JSON.parse = function(data) {
        return typeof(JSON) !== 'undefined' ?
        JSON.parse(data) :
        (function(src) {
            // Taken from RFC 4627 (http://tools.ietf.org/html/rfc4627)
            var json = !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(src.replace(/"(\\.|[^"\\])*"/g, '')));
            return json ? eval('(' + json + ')') : null;
        })(data);
    }


    /***********************************************************************
        Event
    ************************************************************************/

    Yeti.Evt = new Object();

    /* Yeti.Evt.bind
     * Wrapper for .addEventListener and .attachEvent.
     */

    Yeti.Evt.bind = function(el, type, listener, capture) {
        if ((type.substr(0,2).toLowerCase()) == 'on') {
            type = type.substr(2);
        }

        if (typeof(capture) != 'boolean') {
            capture = false;
        }

        if (el.addEventListener){
            el.addEventListener(type, listener, capture);
        } else if (el.attachEvent) {
            /* In IE events always bubble, no capturing possibility. */
            //el.attachEvent('on' + type, listener);
            var _type = 'on' + type;

            if (el[_type] === null) {
                el[_type] = listener;
            } else {
                el[_type] = function() {
                    el[_type](); listener();
                }
            }
        } else {
            ;
        }
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

        return document.importNode ?
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

            }
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
                elems = [],
                selection = src.getElementsByTagName('*')
            ;

            for (var i=0, _len=selection.length; i<_len; i++) {
                if (class_pattern.test(selection[i].className)) {
                    elems.push(selection[i]);
                }
            }

            return elems;
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

    /* Yeti.DOM.appendClone
     * Append a cloned node to an element. Needed because elem.appendChild()
     * on an imported node (document.importNode) is broken under IE
     */

    Yeti.DOM.appendClone = function(node, cloned_node) {
        document.importNode
            ? node.appendChild(cloned_node)
            : node.appendChild(cloned_node).innerHTML = cloned_node.innerHTML;
    }

    /* Yeti.DOM.addClass
     * Append a class to an element.
     */

    Yeti.DOM.addClass = function(elem, value) {
        var values = value.split(/\s+/);

        if (elem.className) {
            values = values.concat(elem.className.split(/\s+/)).sort();
            var i = 0,
                _len = values.length
            ;

            while (i < _len) {
                while(values[i] === values[i+1]) {
                    values.splice(i, 1);
                    _len--;
                }
                i++;
            }
        }

        elem.className = values.join(' ');
    }

    /* Yeti.DOM.removeClass
     * Remove a class from an element.
     */

    Yeti.DOM.removeClass = function(elem, value) {
        if (elem.className) {
            var values = value.split(' '),
                new_cls = elem.className
            ;

            for (var i=0, _len=values.length; i<_len; i++) {
                new_cls = new_cls.replace(values[i], ' ');
            }

            elem.className = Yeti.Str.trim(new_cls.replace(/\s{2,}/g, ' '))
        }
    }

    /* Yeti.DOM.getWindowSize
     * Returns the size of the browser window.
     */

    Yeti.DOM.getWindowSize = function() {
        return typeof(window.innerHeight) == 'number' ? {
            height : window.innerHeight,
            width : window.innerWidth
        } : document.body && document.body.clientHeight ? {
                height : document.body.clientHeight,
                width : document.body.clientWidth
            } : document.documentElement &&
                document.documentElement.clientHeight ? {
                    height : document.documentElement.clientHeight,
                    width : document.documentElement.clientWidth
                } : undefined
    }


    /***********************************************************************
        Tools
    ************************************************************************/

    Yeti.Tools = new Object();

    /* Yeti.Tools.protoStr
     * Returns a detailed text of the constructor
     */

    Yeti.Tools.protoStr = function(obj) {
        return Object().toString.call(obj);
    }

    /* Yeti.Tools.Serializer
     * Serialize an object.
     */

    Yeti.Tools.Serializer = function(obj) {
        this.qs = [];

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                this._encodeValue(key, obj[key]);
            }
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

    /* Yeti.Tools.Dispatcher
     * A simple subscribe/publish dispatcher
     */ 
 
    Yeti.Tools.Dispatcher = function(scope) {
        this.default_scope = scope || this;
        this.callbacks = {};
    }

    Yeti.Tools.Dispatcher.prototype.add = function(evt, callback, scope) {
        if (!this.callbacks[evt]) {
            this.callbacks[evt] = [];
        }

        this.callbacks[evt].push({
            'callback' : callback,
            'scope' : scope || this.default_scope
        });
    }

    Yeti.Tools.Dispatcher.prototype.remove = function(evt) {
        if (this.callbacks[evt]) {
            delete this.callbacks[evt];
        }
    }

    Yeti.Tools.Dispatcher.prototype.fire = function(evt, params) {
        var cbs = this.callbacks[evt];

        if (!cbs) {
            return false;
        }

        for (var i=0, _len=cbs.length; i<_len; i++) {
            cbs[i].callback.call(cbs[i].scope, params, arguments);
        }
    }

})(window);
