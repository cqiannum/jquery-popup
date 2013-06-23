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

                if (metas.type) {
                    obj.type = metas.type;
                }

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
            this.$close = $(options.tpl.close);
            this.$loading = $(options.tpl.loading);
    		this.$container = this.$wrap.find('.' + this.namespace + '-container');
            this.$contentWrap = this.$container.find('.' + this.namespace + '-content-wrap');
    		this.$content = this.$container.find('.' + this.namespace + '-content');

            this.bindEvent();

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

            this.$close.appendTo(this.$contentWrap);
            this.$loading.appendTo(this.$container);
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
    		
    		this.settings = $.extend({}, this.options, item.options);

    		this.index = index;
    		this.type = this.settings.type || item.type;
    		this.url = item.url;

    		this.$container.addClass(this.namespace + '-' + item.type + '-holder');



            // deal with for image type
            // if (this.type === 'image') {

            //     this.$wrap.css({
            //         'overflow-y': 'auto',
            //         'overflow-x': 'hidden'
            //     });

            //     // retina only for image
            //     // if (window.devicePixelRatio > 1) {
            //     //     this.url = this.options.retina.replace(item.url);
            //     //     this.$container.addClass(this.namespace + '-image-retina');
            //     // }
            // } else {
            //     this.$wrap.css({
            //         'overflow-y': 'scroll',
            //         'overflow-x': 'hidden'
            //     });
            // }

    		this.types[item.type].load(this, dtd);
    		this.$container.trigger('change.popup', this);

    		dtd.done(function($data) {
    			self.$content.empty().append($data);
    			self.afterLoad();
    		});
    	},
    	afterLoad: function() {
            this.resize();
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
            
            // give time to render css3 transition
            setTimeout(function() {
                
            }, 17);

            self.$overlay.remove();
            self.$wrap.remove();
            $('body').removeClass(self.namespace + '-body');
    	},
    	preload: function() {
    		return;
    	},

        resize: function() {
            if (this.type === 'image') {
                this.types[this.type].resize(this);
            }
        },
        bindEvent: function() {
            this.$close.on('click', $.proxy(this.close, this));
            this.$wrap.on('click', function(e) {
                console.log(e.target);
            });
        },

    	// helper function
    	checkType: function(url) {
    		var type = null;
    		$.each(this.types, function(key,value) {
    			if ($.type(value.match) === 'function') {               
                    if (value.match(url)) {
                        type = value.match(url);
                    }
    			}
    		});
    		
    		if (type === false) {
    			throw new Error('unkonwn type !');
    		} else {
    			return type;
    		}
    	},
    	showLoading: function() {
            this.$container.addClass(this.namespace + '-loading');
        },
    	hideLoading: function() {
            this.$container.removeClass(this.namespace + '-loading');
        }
    };

    Popup.defaults = {
    	namespace: 'popup',
    	theme: 'default',
    	transition: 'fade',

        // do we need a render ?
        render: function(data) {
            return data;
        },

        // for retina to change image
        retina: {
            ratio: 2,

            // replace image src
            replace: function(url) {
                return url.replace(/\.\w+$/, function(m) { return '@2x' + m; });
            }
        },

        ajax: {
            // expect return html string
            render: function(data) {
                return $(data);
            },
            options: {
                dataType: 'html',
                headers  : { 'popup': true } 
            }
        },

    	tpl: {
    		overlay: '<div class="popup-overlay"></div>',
    		container: '<div class="popup-wrap"><div class="popup-container"><div class="popup-content-wrap"><div class="popup-content"></div></div></div></div>',    
            loading: '<div class="popup-loading">loading...</div>',

            // here use buttom but not <a> element
            // thanks to http://www.nczonline.net/blog/2013/01/29/you-cant-create-a-button/
            close: '<button title="Close" type="button" class="popup-close">x</button>',
            next: '<button title="next" type="button" class="popup-next"></button>',
            prev: '<button title="prev" type="button" class="popup-prev"></button>'
        }
    };

    Popup.prototype.types = {
    	image: {
    		match: function(url) {
    			if (url.match(/\.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)$/i)) {
    				return 'image';
    			} else {
    				return false;
    			}
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
    							callback();
    							clearInterval(timer);
    							return;
    						}

                            // for IE 8/7 and below
                            // thanks to http://www.jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie/
                            if (img.width) {
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

    				interval(1);
    		},

            // Progressive Image Rendering
            // and we need konw image width before add it to page
            // thanks to http://www.codinghorror.com/blog/2005/12/progressive-image-rendering.html
    		load: function(instance, dtd) {
    			var self = this,
                    img = new Image();

    			img.src = instance.url;
                $(img).addClass(instance.namespace + '-image');

    			img.onload = function() {
                    instance.hideLoading();
                    instance.$container.addClass(instance.namespace + '-ready');
                };

                img.onerror = function() {
                    this.onload = this.onerror = null;
                    instance.$container.addClass(instance.namespace + '-fail');
                    instance.hideLoading();
                    self.errorHandle();                 
                };

                if (img.complete === undefined || !img.complete) {
                    instance.showLoading();
                }

                this.getSize(img, function() {
                    if($.type(dtd.resolve) === 'function') {
                        // if (window.devicePixelRatio > 1) {
                        //     $(img).css({
                        //         'max-width': img.width / instance.options.retina.ratio,
                        //         'width': '100%'
                        //     });
                        // }
                        dtd.resolve(img);
                    } else {
                        throw new Error('dtd is not a deferred object !');
                    } 
                });
    		},            
            resize: function(instance) {
                var height = instance.$container.height();

                // todo avoid visit Dom
                instance.$content.find('img').css({
                    // minus five to be sure image height less than container
                    'max-height': parseInt(height) - 5 
                });
            },

    		errorHandle: function() {
                return ;
    		},

    		preload: function(url) {
    			var img = new Image();
    			img.src = url;
    		}
    	},
        iframe: {
            match: function(url) {
                if (url.match(/\.(ppt|PPT|tif|TIF|pdf|PDF)$/i)) {
                    return 'iframe';
                } else {
                    return false;
                }
            },  
            load: function(instance, dtd) {
                var iframe = '<iframe class="' + instance.namespace +'-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>',
                    $iframe = $(iframe).attr('src', instance.url);


                dtd.resolve($iframe);
            }
        },
        inline: {
            match: function(url) {
                if (url.charAt(0) === "#") {
                    return 'inline';
                } else {
                    return false;
                }
            },
            load: function(instance, dtd) {
                 var $inline = $(instance.url).html();
                 dtd.resolve($inline);
            }
        },
        ajax: {
            load: function(instance, dtd) {
                var ajax = instance.settings.ajax;

                $.ajax($.extend({}, ajax.options, {
                    url: instance.url,
                    error: function() {},
                    success: function(data) {
                        var $ajax;
                        if ($.type(ajax.render) === 'function') {
                            $ajax = ajax.render(data);
                        } else {
                            $ajax = $(data);
                        }
                        dtd.resolve($ajax);
                    }
                }))

            }
        },
        swf: {
            load: function(instance, dtd) {

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