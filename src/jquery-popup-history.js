// history plugin
// fix me
(function(undefined) {

    var hash = window.location.hash;
    var popId = 0;
    var hashEmit = true;
    var current = null;
    // for history
    function parseHash(hash) {
        var arr = hash.split('/');
        return {
            id: hash.replace('#',''),
            index: parseInt(arr[2]) || 0
        }
    }

    this.$element.each(function(i,v) {
        var name = $(v).data('popup-group'),
            index = i;

        if (!name) {
            popId++;
            name = popId;
        }

        $(v).attr('popup-id','/popup-' + name + '/' + index);
    });

    // hash close
    hashEmit = false;
    window.location.hash = '/';
    setTimeout(function() {
        hashEmit = true;
    }, 0);

    // history
    //fixme: control hasEmit value accuratly, add to event
    hashEmit = false;
    window.location.hash = '#' + $(item.target).attr('popup-Id');
    setTimeout(function() {
        hashEmit = true;
    }, 0);

    // open hash when use browser navigate
    $(window).on('hashchange.popup', function() {
        if (!hashEmit) {
            return false;
        }

        var hash = window.location.hash,
            result = parseHash(hash),
            $element = $('[popup-id="'+ result.id +'"]'),
            instance = $element.data('popup'); 

        if (!instance) {
            if (current) {
                current.close();
            }
            return false;
        }

        if (instance.active === true) {
            instance.goto(result.index);
        } else {
            $element.click();
        }
    });

    fixme: 'popup' use namespace
    if ($.type(hash) === 'string' &&  hash.match(/(popup)/i)) {
        var result = parseHash(hash);

        setTimeout(function() {
            var $element = $('[popup-Id="' + result.id +'"]'),
                instance = $element.data('popup');

            if (instance.active === true) {
                instance.goto(result.index);
            } else {
                $element.click();
            }
        }, 17);
    }
})();