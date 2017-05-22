/*
 * TouchScroll - using dom overflow:scroll
 * by kmturley, edited by corneldm
 */

/*globals window, document */

var TouchScroll = function () {
    'use strict';

    var module = {
        drag: false,
        time: 0.04,
        isIE: (window.navigator.userAgent.toLowerCase().indexOf('msie') > -1 || window.navigator.userAgent.toLowerCase().indexOf('trident/7.0') > -1),
        isFirefox: window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        animationId: undefined,
        /**
         * @method init
         */
        init: function (options) {
            var me = this;
            this.options = options;

            // find target element or fall back to body
            if (options) {
                if (options.id) {
                  this.el = document.getElementById(options.id);
                } else if (options.el) {
                  this.el = options.el;
                }
            }
            if (!this.el) {
                if (this.isIE || this.isFirefox) {
                    this.el = document.documentElement;
                } else {
                    this.el = document.body;
                }
            }

            // if draggable option is enabled add events
            if (options.draggable === true) {
                if (this.isIE) {
                    document.ondragstart = function () { return false; };
                }
                if (this.isIE || this.isFirefox) {
                    this.body = document.documentElement;
                } else {
                    this.body = document.body;
                }
                this.addEvent('mousedown', this.el, function (e) { me.onMouseDown(e); });
                this.addEvent('mousemove', this.el, function (e) { me.onMouseMove(e); });
                this.addEvent('mouseup', this.body, function (e) { me.onMouseUp(e); });
            }

            // pan event handler
            if (options.panHandler) {
                this.addEvent('scroll', this.el, function (e) { options.panHandler(e); });
            }

            // if scroll options exist add events
            if (options && options.prev) {
                this.prev = document.getElementById(options.prev);
                this.addEvent('mousedown', this.prev, function (e) {
                    me.onMouseDown(e);
                });
                this.addEvent('mouseup', this.prev, function (e) {
                    me.diffx = options.distance ? (-options.distance / 11) : -11;
                    me.onMouseUp(e);
                });
            }
            if (options && options.next) {
                this.next = document.getElementById(options.next);
                this.addEvent('mousedown', this.next, function (e) {
                    me.onMouseDown(e);
                });
                this.addEvent('mouseup', this.next, function (e) {
                    me.diffx = options.distance ? (options.distance / 11) : 11;
                    me.onMouseUp(e);
                });
            }
        },
        /**
         * @method addEvent
         */
        addEvent: function (name, el, func) {
            if (el.addEventListener) {
                el.addEventListener(name, func, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + name, func);
            } else {
                el[name] = func;
            }
        },
        /**
         * @method cancelEvent
         */
        cancelEvent: function (e) {
            if(e.preventDefault) e.preventDefault();
        },
        /**
         * @method onMouseDown
         */
        onMouseDown: function (e) {
            if (this.drag === false || this.options.wait === false) {
                if(this.el.className.indexOf('dragging') === -1)
                    this.el.className += ' dragging';
                if (this.animationId)
                    window.cancelAnimationFrame(this.animationId);
                this.drag = true;
                this.cancelEvent(e);
                this.startx = e.clientX + this.el.scrollLeft;
                this.starty = e.clientY + this.el.scrollTop;
                this.diffx = 0;
                this.diffy = 0;
                this.windowDiffY = 0;
            }
        },
        /**
         * @method onMouseMove
         */
        onMouseMove: function (e) {
            if (this.drag === true) {
                this.cancelEvent(e);
                this.diffx = (this.startx - (e.clientX + this.el.scrollLeft));
                this.diffy = (this.starty - (e.clientY + this.el.scrollTop));

                var expectedScrollTop = this.el.scrollTop + this.diffy;

                this.el.scrollLeft += this.diffx;
                this.el.scrollTop += this.diffy;

                // let the click and drag bubble up to the window
                if (this.el.scrollTop !== expectedScrollTop) {
                    var windowScroll = expectedScrollTop - this.el.scrollTop - this.windowDiffY;
                    this.windowDiffY += windowScroll;

                    if (!$('body').hasClass('-drag-and-dropping')) {
                        if (this.isIE || this.isFirefox) {
                            $("html").scrollTop($("html").scrollTop() + windowScroll);
                        } else {
                            $("body").scrollTop($("body").scrollTop() + windowScroll);
                        }
                    }
                }
            }
        },
        /**
         * @method onMouseMove
         */
        onMouseUp: function (e) {
            if (this.drag === true) {
                if (!this.options.wait) {
                    this.drag = null;
                }
                this.cancelEvent(e);

                if(this.el.className.indexOf('dragging') !== -1)
                    this.el.className = this.el.className.replace(' dragging', '');

                var me = this,
                    start = 1,
                    animate = function () {
                        var step = Math.sin(start);
                        if (step <= 0) {
                            me.diffx = 0;
                            me.diffy = 0;
                            window.cancelAnimationFrame(animate);
                            me.drag = false;
                        } else {
                            me.el.scrollLeft += me.diffx * step;
                            me.el.scrollTop += me.diffy * step;
                            start -= me.time;
                            me.animationId = window.requestAnimationFrame(animate);
                        }
                    };
                //animate(); //Disabled for now
            }
        },
        /**
         * @method onMouseMove
         */
        onMouseWheel: function (e) {
            this.cancelEvent(e);
            if (e.detail) {
                this.zoom -= e.detail;
            } else {
                this.zoom += (e.wheelDelta / 1200);
            }
            if (this.zoom < 1) {
                this.zoom = 1;
            } else if (this.zoom > 10) {
                this.zoom = 10;
            }
            /*
            this.elzoom.style.OTransform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            this.elzoom.style.MozTransform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            this.elzoom.style.msTransform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            this.elzoom.style.WebkitTransform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            this.elzoom.style.transform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            */
            this.elzoom.style.zoom = this.zoom * 100 + '%';
            //this.el.scrollLeft += e.wheelDelta / 10;
            //this.el.scrollTop += e.wheelDelta / 8;
        }
    };
    return module;
};
