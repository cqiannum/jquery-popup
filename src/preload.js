
(function($, document, window, undefined) {
	var Preload = $.preload = function(imgs, options) {
		if (!this instanceof Preload) {
			return new Preload(imgs, options);
		}

		// array contains urls
		this.images = imgs;

		this.settings = $.extend({}, Preload.defaultes, options);
		this.init();
	};

	Preload.prototype = {
		constructor: Preload,
		init: function() {
			var dtd = $.Deferred(),
				args = [],
				imgs = [],
				self = this;

			$.each(this.images, function(i,v) {
				var dtd = self.load(v);
				dtd.done(function(img) {
					imgs.push(img);
				});
				args.push(dtd);
			});

			$.when.apply(null, args).done(function(imgs) {
				if ($.type(self.settings.all) === 'function') {
					self.settings.all(imgs);
				}
			});
		},
		load: function(url) {
			var dtd = $.Deferred(),
				self = this,
				img = new Image();

			img.src = url;

			img.onLoad = function() {
				dtd.resolve(img);
				if ($.type(self.settings.each) === 'function') {
					self.settings.each(img);
				}
			};

			img.onError = function() {
				dtd.reject(img);
				if ($.type(self.settings.error) === 'function') {
					self.settings.error(img);
				}
				if ($.type(self.settings.each) === 'function') {
					self.settings.each(img);
				}
			};

			if (this.settings.getSize === true) {
				this.getSize(img, function(img) {
					if ($.type(self.settings.onGetSize) === 'function') {
						self.settings.onGetSize(img);
					}
				});
			}

			return dtd.promise();
		},
		getSize: function(img, callback) {
			var timer,
				counter = 0,
				interval = function(delay) {
					if (timer) {
						clearInterval(timer);
					}

					timer = setInterval(function() {
						if (img.naturalWidth > 0) {
							callback(img);
							clearInterval(timer);
							return;
						}

                        // for IE 8/7 and below
                        // thanks to http://www.jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie/
                        if (img.width) {
                            callback(img);
                            clearInterval(timer);
                            return;
                        }

                        if(counter > 200) {
                            clearInterval(timer);
                        }

                        counter++;
                        if(counter === 3) {
                            interval(10);
                        } else if(counter === 40) {
                            interval(50);
                        } else if(counter === 100) {
                            interval(500);
                        }
					}, delay);
				};

			interval(1);
    	}
	};

	Preload.defaultes = {
		getSize: false,

		error: function(img) {
			console.log('error');
		},
		each: function(img) {
			console.log('each');
		},
		all: function(imgs) {
			console.log('all');
		},

		onGetSize: function(img) {
			console.log('getSize');
		}
	};

	$.fn.preload = function(options) {
		if (!$(this).data('preload')) {
            $(this).data('preload', new Preload(this, options)); 
        } 
	};

})(jQuery, document, window);