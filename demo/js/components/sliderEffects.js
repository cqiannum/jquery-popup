;
(function($, document, window, undefined) {
    // Optional, but considered best practice by some
    "use strict";

    Popup.sliderEffects.zoom = {
        defaults: {
            speed: 500,
            easing: 'swing',
        },
        init: function(rez) {
            var opts = $.extend({},this.defaults,Popup.current.sliderSetting);

            Popup.$content.empty();
            Popup.$content.append(Popup.current.content);

            Popup.$container.stop().animate({
                top: rez.top,
                left: rez.left,
            },{
                duration: 500,
                easing: 'swing',
            });
            Popup.$content.stop().animate({
                width: rez.containerWidth,
                height: rez.containerHeight,
            },{
                duration: 500,
                easing: 'swing',
                complete: function() {

                }
            });
            

        }
    }; 
    Popup.sliderEffects.fade = {
        defaults: {
            speed: 500,
            easing: 'swing',
        },
        init: function(rez) {
            var opts = $.extend({},this.defaults,Popup.current.sliderSetting);
            Popup.$container.css({
                top: rez.top,
                left: rez.left,
            });
            
            //resize set on content
            Popup.$content.css({
                width: rez.containerWidth,
                height: rez.containerHeight,
            });
            Popup.previous.content.css({
                zIndex: 2,
            });

            Popup.$content.append(Popup.current.content);

            Popup.previous.content.animate({
                'opacity': 0,
            },{
                duration: 500,
                easing: 'swing',
                complete: function(){
                    console.log($(this));
                    
                    $(this).remove();
                }
            });
            //Popup.$content.append(Popup.current.content);
        },
    };
   
})(jQuery, document, window);


