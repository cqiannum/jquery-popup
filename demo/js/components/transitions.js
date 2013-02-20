;
(function($, document, window, undefined) {
    // Optional, but considered best practice by some
    "use strict";

    Popup.transitions.zoom = {
        defaults: {
            openSpeed: 500,
            closeSpeed: 500,
        },
        opts: {},

        openEffect: function(rez) { 
            var el = Popup.current.element,pos,
                origin, startPos,endPos;

            this.opts = $.extend({},this.defaults,Popup.current.transitionSetting),    
            origin = $(el).offset();
            pos = {
                x: $(document).scrollLeft(),
                y: $(document).scrollTop(),
            }
            startPos = {
                x: origin.left - pos.x,
                y: origin.top - pos.y,
            };

            Popup.$overlay.fadeIn();

            Popup.$container.css({
                top: startPos.y,
                left: startPos.x,
                display: 'block',
            }).animate({
                top: rez.top,
                left: rez.left,
            },400);
            Popup.$content.css({
                width: 0,
                height: 0,
            }).animate({
                'width': rez.containerWidth,
                'height': rez.containerHeight,
            },400);
        },
        closeEffect: function() {
            var opts = $.extend({},this.defaults,Popup.current.transitionSetting);
            if (!Popup._isOpen) {
                return
            }
            if (Popup.$overlay) {
                Popup.$overlay.fadeOut(opts.closeSpeed,Popup.close);
            } else {
                Popup.$container.fadeOut(opts.closeSpeed,Popup.close);
            }
        },
    };
    Popup.transitions.fade = {
        defaults: {
            openSpeed: 500,
            closeSpeed: 500,
        },
        openEffect: function(rez){
            var opts = $.extend({},this.defaults,Popup.current.transitionSetting);
            if (Popup._isOpen) {
                return
            }

            Popup.$container.css({
                top: rez.top,
                left: rez.left,
            });
            //resize set on content
            Popup.$content.css({
                width: rez.containerWidth,
                height: rez.containerHeight,
            });

            if (Popup.$overlay) {
                Popup.$container.css({'display': 'block'});
                Popup.$overlay.fadeIn(opts.openSpeed);
            } else {
                Popup.$container.fadeIn(opts.openSpeed);
            }
        },
        // closeEffect need callback function to close popup
        closeEffect: function() {
            var opts = $.extend({},this.defaults,Popup.current.transitionSetting);
            if (!Popup._isOpen) {
                return
            }
            if (Popup.$overlay) {
                Popup.$overlay.fadeOut(opts.closeSpeed,Popup.close);

            } else {
                Popup.$container.fadeOut(opts.closeSpeed,Popup.close);
            }
        },
    };
    Popup.transitions.dropdown = {
        defaults: {
            openSpeed: 150,
            closeSpeed: 800,
            span: 20,
        },
        opts: {},

        openEffect: function(rez) {
            var top = rez.top, left = rez.left,
                width = rez.containerWidth, 
                height = rez.containerHeight,
                span = 40;
            Popup.$overlay.fadeIn();
            Popup.$content.css({
                'width': width,
                'height': height,
            });
            Popup.$container.css({
                'display': 'block',
                'top': -height,
                'left': left,
            }).animate({
                'top': top + span,
            },{
                duration: 800,
                easing: 'swing', 
            }).animate({
                'top': top,
            },{
                duration: 500,
                easing: 'swing',
            });
        },
        closeEffect: function() {
            var opts = $.extend({},this.defaults,Popup.current.transitionSetting),
                height = Popup.$container.height();
            if (!Popup._isOpen) {
                return
            }
            Popup.$container.animate({
                'top': -height,
            },{
                duration: 800,
                easing: 'swing', 
            });

            if (Popup.$overlay) {
                Popup.$overlay.fadeOut(opts.closeSpeed,Popup.close);
            } else {
                Popup.$container.fadeOut(opts.closeSpeed,Popup.close);
            }
        },
    };

})(jQuery, document, window);


