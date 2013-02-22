
//regiter title component
(function(){
	$.Popup.registerComponent('title',{
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