
//register thumbnail
(function(){
	$.Popup.registerComponent('thumbnail',{
	    defaults: {
	        tpl: ''
	    },
	    onReady: function(instance,options) {
	        var settings = $.extend(true,defaults,options);

	        $(instance).on('change.popup',function() {

	        });
	    }
	});
})();