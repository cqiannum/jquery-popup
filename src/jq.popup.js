/*
 * popup
 * https://github.com/amazingSurge/popup
 *
 * Copyright (c) 2013 amazingSurge
 * Licensed under the CC, BY-NC licenses.
 */

(function($, document, window, undefined) {
	// Optional, but considered best practice by some
    "use strict";

    var Popup = $.popup = function(element, options) {

    	this.$element = $(element);

    	// for gallery
        this.active = false;
        this.isGroup = false;

        this.group = [];
        
        // current info
        this.index = 0;
        this.total = 0;
        this.type = '';
        this.url = '';
        this.target = null;

        if (!options) {
        	options = {};
        }

        this.options = $.extend({}, Popup.defaults, this.themes[options.theme], options);
        this.namespace = this.options.namespace;

        var comps =  this.themes[options.theme] || '';
        this.comps = comps.split(',');

        this.init();
    };

    Popup.prototype = {
    	constructor: Popup,
    	themes: {},
    	components: {},
    	init: function() {
    		var self = this;

    		this.$element.on('click', function() {
    			var index,group,tag;

    			tag = $(this).data('popup-group');
                group = self.filterGroup(tag, self.$element);
                index = $(group).index(this) || 0;              
                self.group = self.getGroupConfig.call(self, group);

                if (group.length > 1) {
                    self.isGroup = true;
                }

    			self.open();
    			self.goto(index);

    			return false;
    		});

            $(window).on('resize', $.proxy(this.resize, this));
    	},

    	filterGroup: function(tag, collects) {
            var group = null;

            if (collects.length === 1) {
                group = collects;
            } else {
                group = collects.filter(function() {
                    var data = $(this).data('popup-group');
                    if (tag) {
                        return data === tag;
                    }
                }); 
            }

            return group;
        },
        getGroupConfig: function(group) {
            var items = [], self = this;

            if ($.isArray(group)) {
                return group;
            }

            $.each(group, function(i, v) {
                var metas = {},
                    url =  $(v).attr('href'),
                    obj = {
                        url: url,
                        type: self.options.type || self.checkType(url) 
                    };

                $.each($(v).data(), function(k, v) {
                    if (/^popup/i.test(k)) {
                        metas[k.toLowerCase().replace(/^popup/i, '')] = v;
                    }
                });

                obj.options = metas;         
                items.push(obj);
            });

            return items;
        },

    	create: function() {
    		
    		var self = this,
    			options = this.options;

    		// creat basic element
    		this.$overlay = $(options.tpl.overlay);
    		this.$wrap = $(options.tpl.container);
    		this.$container = this.$wrap.find('.' + this.namespace + '-container');
    		this.$content = this.$container.find('.' + this.namespace + '-content');

    		if (this.isGroup) {
    			this.$next = $(ptions.tpl.next).appendTo(this.$container);
    			this.$prev = $(options.tpl.prev).appendTo(this.$container);

    			this.$next.on('click', $.proxy(this.next, this));
    			this.$prev.on('click', $.proxy(this.prev, this));
    		}

    		// initial custom component
    		$.each(this.comps, function(i,v) {
    			if (self.components[v]) {
    				self.components[v].init(self);
    			}		
    		});

    		this.$overlay.addClass(this.namespace + '-' + this.options.transition + '-open');

            // for remove scroll
            $('body').addClass(this.namespace + '-body');

    		this.$overlay.appendTo('body');
    		this.$wrap.appendTo('body');
    	},
    	open: function() {
    		this.create();
    		this.active = true;
    	},
    	goto: function(index) {
    		var dtd = $.Deferred(),
    			self = this,
    			item = this.group[index];
    		
    		this.settings = $.extend({}, this.options, item);

    		this.index = index;
    		this.type = this.settings.type || this.checkType(itme.url);
    		this.url = item.url;

    		this.$container.addClass(this.namespace + '-' + this.type + '-holder');

            // deal with for image type
            if (this.type === 'image') {
                this.$wrap.css({
                    'overflow-y': 'auto',
                    'overflow-x': 'hidden'
                });
            } else {
                this.$wrap.css({
                    'overflow-y': 'scroll',
                    'overflow-x': 'hidden'
                });
            }

    		this.types[item.type].load(this, dtd);
    		this.$container.trigger('change.popup', this);

    		dtd.done(function($data) {
    			self.$content.empty().append($data);
    			self.afterLoad();
    		});
    	},
    	afterLoad: function() {
    		if (this.options.preload === true) {
    			this.preload();
    		}
    	},
    	next: function() {
            var index = this.index;
            index++;
            if (index >= this.total) {
                index = 0;
            }

            this.direction = 'next';
            this.goto(index);
        }, 
        prev: function() {
            var index = this.index;
            index--;
            if (index < 0) {
                index = this.total - 1;
            }
            this.direction = 'prev';
            this.goto(index);
        },
    	close: function() {
            var self = this;
    	      
            this.$overlay.removeClass(this.namespace + '-' + this.options.transition + '-open').addClass(this.namespace + '-' + this.options.transition + '-close');
            
            // give time to css3 transition
            setTimeout(function() {
                self.$overlay.remove();
                self.$container.remove();
                $('body').removeClass(self.namespace + '-body');
            }, 17)

    	},
    	preload: function() {
    		return;
    	},

        resize: function() {
            if (this.type === 'image') {
                this.types[this.type].resize(this);
            }
        },

    	// helper function
    	checkType: function(url) {
    		var type = null;
    		$.each(this.types, function(key,value) {
    			if ($.type(value.match) === 'function') {
    				type = value.match(url);
    			}
    		});
    		
    		if (type === null) {
    			throw new Error('unkonwn type !');
    		} else {
    			return type;
    		}
    	},
    	showLoading: function() {},
    	hideLoading: function() {}
    };

    Popup.defaults = {
    	namespace: 'popup',
    	theme: 'default',
    	transition: 'fade',
    	tpl: {
    		overlay: '<div class="popup-overlay"></div>',
    		container: '<div class="popup-wrap"><div class="popup-container"><div class="popup-content"></div></div></div>',
            
            loading: '<div class="popup-loading"></div>',
            close: '<button title="Close" type="button" class="popup--close"></button>',
            next: '<button title="next" type="button" class="popup--next"></button>',
            prev: '<button title="prev" type="button" class="popup--prev"></button>'
        }
    };

    Popup.prototype.types = {
    	image: {
    		match: function(url) {
    			if (url.match(/\.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)$/i)) {
    				return 'image';
    			} else {
    				return ;
    			}
    		},
    		getSize: function(img, callback) {
    			var timer,
    				count = 0,
    				internal = function(delay) {
    					if (timer) {
    						clearInterval(timer);
    					}

    					timer = setInterval(function() {
    						if (img.naturalWidth > 0) {
    							callback();
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

    				internal(1);
    		},

    		load: function(instance, dtd) {
    			var img = new Image();

    			img.src = instance.url;
                $(img).addClass(instance.namespace + '-image')

    			img.onload = function() {
                    instance.hideLoading();
                };

                img.onerror = function() {
                    this.onload = this.onerror = null;
                    self.errorHandle();
                };

                if (img.complete === undefined || !img.complete) {
                    instance.showLoading();
                }

                this.getSize(img, function() {
                    if($.type(dtd.resolve) === 'function') {
                        dtd.resolve(img);
                    } else {
                        throw new Error('dtd is not a deferred object !');
                    } 
                });
    		},

             
            resize: function(instance) {
                var height = instance.$container.height();
                instance.$content.find('img').css({
                    // minus five to be sure image height less than container
                    'max-height': parseInt(height) - 5 
                });
            },

    		errorHandle: function() {

    		},

    		preload: function(url) {
    			var img = new Image();
    			img.src = url;
    		}

    	}
    };

    $.extend(Popup, {
    	
    });

    $.fn.popup = function(options) {

    	if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'popup');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            if (!$.data(this, 'popup')) {
                $.data(this, 'popup', new Popup(this, options));
            }
        }
    };


})(jQuery, document, window);