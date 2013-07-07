// keyboard 
(function(document, undefined) {
    var $doc = $(document);
    var keyboard = {
        keys: {
            'UP': 38,
            'DOWN': 40,
            'LEFT': 37,
            'RIGHT': 39,
            'RETURN': 13,
            'ESCAPE': 27,
            'BACKSPACE': 8,
            'SPACE': 32
        },
        map: {},
        bound: false,
        press: function(e) {
            var key = e.keyCode || e.which;
            if (key in keyboard.map && typeof keyboard.map[key] === 'function') {
                keyboard.map[key].call(self, e);
            }
        },
        attach: function(map) {
            var key, up;
            for (key in map) {
                if (map.hasOwnProperty(key)) {
                    up = key.toUpperCase();
                    if (up in keyboard.keys) {
                        keyboard.map[keyboard.keys[up]] = map[key];
                    } else {
                        keyboard.map[up] = map[key];
                    }
                }
            }
            if (!keyboard.bound) {
                keyboard.bound = true;
                $doc.bind('keydown', keyboard.press);
            }
        },
        detach: function() {
            keyboard.bound = false;
            keyboard.map = {};
            $doc.unbind('keydown', keyboard.press);
        }
    };

    $doc.on('popup::create', function(event, instance) {
        if (instance.isGroup === true && instance.options.keyboard === true) {
            keyboard.attach({
                escape: $.proxy(instance.close, instance),
                left: $.proxy(instance.prev, instance),
                right: $.proxy(instance.next, instance)
            });
        }
        return false;
    });

    $doc.on('popup::close', function(event, instance) {
        if (instance.isGroup === true && instance.options.keyboard === true) {
            keyboard.detach();
        }
        return false;
    });
})(document);