;(function(ns) {

    var UI = ns.UI = new Object();

    /***********************************************************************
        Frame
    ************************************************************************/

    UI.Frame = function(params) {
        var _self = this;

        /* Default options */
        this.options = {
            zindex : 1000,
            position : 'center',
            onscroll : 'scroll',
            overlay : true,
            title : '',
            width : 300,
            height : 300
        }
        this.update_options(params);

        if (this.options.onscroll == 'scroll') {
            Yeti.Evt.bind(window, 'scroll', function() {
                _self.refresh_position();
            });
        }

        this.container = document.body;
        this.frame = document.createElement('div');
        this.header = document.createElement('div');
        this.body = document.createElement('div');

        this.frame.style.zIndex = this.options.zindex;
        this.frame.style.position = 'absolute';

        if (this.options.overlay) {
            this.overlay = document.createElement('div')
            this.overlay.style.top = 0;
            this.overlay.style.left = 0;
            this.overlay.style.position = 'absolute';
            this.overlay.style.zIndex = this.frame.zIndex - 1;
            Yeti.DOM.addClass(this.overlay, 'ui-frame-overlay');

            this.overlay.style.width = document.body.scrollWidth;
            this.overlay.style.height = document.body.scrollHeight;

            Yeti.Evt.bind(this.overlay, 'click', function() {
                _self.detach();
            });
        } else {
            this.overlay = undefined;
        }

        Yeti.DOM.addClass(this.frame, 'ui-frame');
        Yeti.DOM.addClass(this.header, 'ui-frame-header');
        Yeti.DOM.addClass(this.body, 'ui-frame-body');

        this.header.appendChild(document.createTextNode(this.options.title));

        this.frame.appendChild(this.header);
        this.frame.appendChild(this.body);

        this.frame.style.width = this.options.width;
        this.frame.style.height = this.options.height;

        this.refresh_position();
    }

    UI.Frame.prototype.update_options = function(opts) {
        for (var i in opts) {
            this.options[i] = opts[i];
        }
    }

    UI.Frame.prototype.get_position = function() {
        var window_size = Yeti.DOM.getWindowSize(),
            scroll_offset = Yeti.DOM.getScrollXY()
        ;

        if (this.options.position == 'center') {
            var left = window_size.width / 2 + scroll_offset.X,
                top = window_size.height / 2 + scroll_offset.Y
            ;

            /* Additional border/padding/... ? */
            if (this.frame.clientLeft) {
                left -= this.frame.clientLeft;
                top -= this.frame.clientTop;
            }

            return {
                left : left - this.options.width / 2,
                top : top - this.options.height / 2
            }
        }
    }

    UI.Frame.prototype.refresh_position = function() {
        var position = this.get_position();

        this.frame.style.left = position.left;
        this.frame.style.top = position.top;
    }

    UI.Frame.prototype.attach = function() {
        if (this.overlay) {
            this.container.appendChild(this.overlay);
        }
        this.container.appendChild(this.frame);
        this.attached = true;
    }

    UI.Frame.prototype.detach = function() {
        if (this.overlay) {
            this.container.removeChild(this.overlay);
        }
        this.container.removeChild(this.frame);
        this.attached = false;
    }

    UI.Frame.prototype.toggle = function() {
        this.attached ? this.detach() : this.attach();
    }

})(Yeti);
