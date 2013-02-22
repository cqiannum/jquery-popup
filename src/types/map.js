
//reigiter map type
(function() {
	$.Popup.registerType('map',{
	    mapsreg: {
	        bing: {
	            reg: /bing.com\/maps/i,
	            split: '?',
	            index: 1,
	            url: "http://www.bing.com/maps/embed/?emid=3ede2bc8-227d-8fec-d84a-00b6ff19b1cb&amp;w=%width%&amp;h=%height%&amp;%id%"
	        },
	        streetview: {
	            reg: /maps.google.com(.*)layer=c/i,
	            split: '?',
	            index: 1,
	            url: "http://maps.google.com/?output=svembed&amp;%id%"
	        },
	        googlev2: {
	            reg: /maps.google.com\/maps\ms/i,
	            split: '?',
	            index: 1,
	            url: "http://maps.google.com/maps/ms?output=embed&amp;%id%"
	        },
	        google: {
	            reg: /maps.google.com/i,
	            split: '?',
	            index: 1,
	            url: "http://maps.google.com/maps?%id%&amp;output=embed"
	        }
	    },
	    match: function(instance) {
	        var href = instance.url,
	            id;
	        if (instance.type !== 'map') {
	            return false;
	        }
	        $.each(this.mapsreg, function(i, e) {
	            if (href.match(e.reg)) {
	                instance.type = 'iframe';
	                if (e.split) {
	                    id = href.split(e.split)[e.index];
	                    href = e.url.replace("%id%", id).replace("%width%", instance.current.width).replace("%height%", instance.current.height);
	                }

	                return false;
	            }
	        });
	        return true;
	    }
	});
})();