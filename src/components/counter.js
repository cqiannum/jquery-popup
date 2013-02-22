
// register counter component
(function(){
	$.Popup.registerComponent('counter',{
	    defaults: {
	        tpl: ''
	    },
	    onReady: function(instance,options) {
	        var self = this,
	            settings = $.extend(true,defaults,options);

	        if (!instance.isGroup) {
	            return
	        }

	        //
	        // css doesnt set here, set in css file in skin
	        //

	        $(instance).on('change.popup',function() {
	            var index = instance.index + 1;
	            $(settings.tpl).text(current + "/" + instance.total)
	        });

	    },
	    load: function() {

	    }   
	});
})();