// slider 
(function(document, undefined) {
    var $doc = $(document);
    // fixme: do I really need isPaused property
    var slider = {
        timer: {},
        clear: function() {
            clearTimeout(this.timer);
        },
        set: function(instance) {
            this.clear();
            if (instance.isGroup) {
                this.timer = setTimeout($.proxy(instance.next, instance), instance.options.playSpeed);
            }
        },
        play: function(instance) {
            instance.isPaused = false;
            this.set(instance);
        },
        pause: function(instance) {
            this.clear();
            instance.isPaused = true;
        }
    };

    $doc.on('popup::change', function(event, instance) {
        if (instance.options.autoSlide === true) {
            slider.play(instance);
        }
    });
    $doc.on('popup::close', function(event, instance) {
        if (instance.options.autoSlide === true) {
            slider.pause(instance);
        }
    })
})(document);