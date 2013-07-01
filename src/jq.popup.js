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

    // fixme: test broswers compatibility
    var hash = window.location.hash;
    var popId = 0;
    var hashEmit = true;
    var current = null;

    var Popup = $.popup = function(element, options) {

    	this.$element = $(element);
        this.$target = null;

    	// for gallery
        this.active = false;
        this.isGroup = false;

        this.group = [];
        
        // current info
        this.index = 0;
        this.total = 0;
        this.type = '';
        this.url = '';
        
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

            this.$element.each(function(i,v) {
                var name = $(v).data('popup-group'),
                    index = i;

                if (!name) {
                    popId++;
                    name = popId;
                }

                $(v).attr('popup-id','/popup-' + name + '/' + index);
            });

    		this.$element.on('click', function() {
    			var index,group,tag;

    			tag = $(this).data('popup-group');
                group = self.filterGroup(tag, self.$element);
                index = $(group).index(this) || 0;              
                self.group = self.getGroupConfig.call(self, group);

                if (group.length > 1) {
                    self.isGroup = true;
                    self.total = group.length;
                }

    			self.open();
    			self.goto(index);

                $(window).on('resize.popup', $.proxy(self.resize, self));
                
    			return false;
    		});
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
                        target: v,
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
    			this.$next = $(options.tpl.next).appendTo(this.$container);
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

            this.$close.appendTo(this.$contentWrap).css({display: 'none'});
            this.$loading.appendTo(this.$container);
    		this.$overlay.appendTo('body');
    		this.$wrap.appendTo('body');
    	},
    	open: function() {
    		this.create();
    		this.active = true;
            current = this;
    	},
    	goto: function(index) {
    		var dtd = $.Deferred(),
    			self = this,
    			item = this.group[index];
    		
    		this.settings = $.extend({}, this.options, item.options);

    		this.index = index;
    		this.type = this.settings.type || item.type;
    		this.url = item.url;

            // history
            // fixme: control hasEmit value accuratly
            hashEmit = false;
            window.location.hash = '#' + $(item.target).attr('popup-Id');
            setTimeout(function() {
                hashEmit = true;
            }, 0);

    		this.$container.addClass(this.namespace + '-' + item.type + '-holder');

            this.showLoading();
    		this.types[item.type].load(this, dtd);
    		this.$container.trigger('change.popup', this);

    		dtd.done(function($data) {              
                self.$close.css({display: 'block'});
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
            return false;
        }, 
        prev: function() {
            var index = this.index;
            index--;
            if (index < 0) {
                index = this.total - 1;
            }
            this.direction = 'prev';
            this.goto(index);
            return false;
        },
    	close: function() {
            var self = this;
    	      
            this.$overlay.removeClass(this.namespace + '-' + this.options.transition + '-open').addClass(this.namespace + '-' + this.options.transition + '-close');
            
            // give time to render css3 transition
            setTimeout(function() {
                
            }, 17);

            $(window).off('resize.popup');

            // hash
            hashEmit = false;
            window.location.hash = '';
            setTimeout(function() {
                hashEmit = true;
            }, 0);

            current = null;

            this.active = false;

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
            var self = this;
            this.$close.on('click', $.proxy(this.close, this));
       
            if (this.options.winBtn === true) {
                this.$wrap.on('click.popup', function(e) {
                    if ($(e.target).hasClass('.' + self.namespace + '-container')) {
                        self.close.call(self);
                    } 
                    return false;
                });
            }

            if (this.isGroup === true && this.options.keyboard === true) {
                this.keyboard.attach({
                    escape: $.proxy(this.close,this),
                    left: $.proxy(this.prev,this),
                    right: $.proxy(this.next,this)
                });
            }
        },
        unbindEvent: function() {
            this.keyboard.detach();
            this.$wrap.off('click.popup');
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
            this.$loading.addClass(this.namespace + '-loading-show');
        },
    	hideLoading: function() {
            this.$loading.removeClass(this.namespace + '-loading-show');
        }
    };

    Popup.defaults = {
    	namespace: 'popup',
    	theme: 'default',
    	transition: 'fade',

        winBtn: true,
        keyboard: true,

        // slider
        autoPlay: true,
        playSpeed: 300,

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

        // type settings
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
        swf: {
            allowscriptaccess: 'always',
            allowfullscreen: 'true',
            wmode: 'transparent',
        },
        html5: {
            width: "100%",
            height: "100%",

            preload: "load",
            controls: "controls",
            poster: '',
            
            type: {
                mp4: "video/mp4",
                webm: "video/webm",
                ogg: "video/ogg",
            },

            // example
            // source: [
            //     {
            //         src: 'video/movie.mp4',
            //         type: 'mp4', // mpc,webm,ogv
            //     },
            //     {
            //         src: 'video/movie.webm',
            //         type: 'webm',
            //     },
            //     {
            //         src: 'video/movie.ogg',
            //         type: 'ogg',
            //     }
            // ]
            source: null
        },

        // template
    	tpl: {
    		overlay: '<div class="popup-overlay"></div>',
    		container: '<div class="popup-wrap"><div class="popup-container"><div class="popup-content-wrap"><div class="popup-content"></div></div></div></div>',    
            loading: '<div class="popup-loading">loading...</div>',

            // here use buttom but <a> element
            // thanks to http://www.nczonline.net/blog/2013/01/29/you-cant-create-a-button/
            close: '<button title="Close" type="button" class="popup-close">x</button>',
            next: '<button title="next" type="button" class="popup-navigate popup-next"></button>',
            prev: '<button title="prev" type="button" class="popup-navigate popup-prev"></button>'
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
                // var iframe = '<iframe class="' + instance.namespace +'-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>',
                //     $iframe = $(iframe);

                // $iframe.load(function() {
                //     instance.hideLoading();
                // });

                // $iframe.attr('src', instance.url);
                // dtd.resolve($iframe);


                // thanks to http://www.planabc.net/2009/09/22/iframe_onload/
                var iframe = document.createElement("iframe");
                iframe.src = instance.url;

                if (iframe.attachEvent){
                    iframe.attachEvent("onload", function(){
                         instance.hideLoading();
                    });
                } else {
                    iframe.onload = function(){
                         instance.hideLoading();
                    };
                }

                iframe.className = instance.namespace + '-iframe';
                dtd.resolve($(iframe));

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
                 instance.hideLoading();
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
                        instance.hideLoading();
                        dtd.resolve($ajax);
                    }
                }))

            }
        },
        swf: {
            match: function(url) {
                if (url.match(/\.(swf)((\?|#).*)?$/i)) {
                    return 'swf';
                } else {
                    return false;
                }
            },
            load: function(instance, dtd) {
                var content = '',
                    embed = '',
                    swf = instance.settings.swf;   

                content += '<object class="' + instance.namespace +'-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%">';
                content += '<param name="movie" value="' + instance.url + '"></param>';

                // this is swf settings
                $.each(swf, function(name, val) {
                    content += '<param name="' + name + '" value="' + val + '"></param>';
                    embed += ' ' + name + '="' + val + '"';
                });

                content += '<embed src="' + instance.url + '" type="application/x-shockwave-flash"  width="100%" height="100%"' + embed + '></embed>';
                content += '</object>';

                instance.hideLoading();
                dtd.resolve($(content));
            }
        },
        html5: {
            match: function(url) {
                if (url.match(/\.(mp4|webm|ogg)$/i)) {
                    return 'html5';
                } else {
                    return false;
                }
            },
            load: function(instance, dtd) {
                var video = '', sourceLists, type,
                    html5 = instance.settings.html5;
                
                video += '<video class="' + instance.namespace + '-html5"';
                video += ' width:' + html5.width;
                video += ' height:' + html5.height;
                video += ' ' + html5.preload;
                video += ' ' + html5.controls;
                video += ' poster:' + html5.poster;
                video += ' >';

                sourceLists = instance.url.split(',');

                //get videos address from url
                if (sourceLists.length !== 0) {
                    for(var i = 0,len = sourceLists.length; i < len; i++) {
                        type = $.trim(sourceLists[i].split('.')[1]);
                        video += '<source src="' + sourceLists[i] + '" type="' + html5.type[type] + '"></source>';
                    }
                }

                //get videos address from options
                if (html5.source && html5.source.length !== 0) {
                    $.each(html5.source, function(i, arr) {
                        video += '<source src="' + arr.src + '" type="' + html5.type[arr.type] + '"></source>';
                    });
                }

                video += '</video>';

                instance.hideLoading();
                dtd.resolve($(video));
            }
        }
    };

    Popup.prototype.keyboard = {
        keys : {
            'UP': 38,
            'DOWN': 40,
            'LEFT': 37,
            'RIGHT': 39,
            'RETURN': 13,
            'ESCAPE': 27,
            'BACKSPACE': 8,
            'SPACE': 32
        },
        map : {},
        bound: false,
        press: function(e) {
            var key = e.keyCode || e.which;
            if ( key in this.map && typeof this.map[key] === 'function' ) {
                this.map[key]();
            }
        },
        attach: function(map) {
            var key, up;
            for( key in map ) {
                if ( map.hasOwnProperty( key ) ) {
                    up = key.toUpperCase();
                    if ( up in this.keys ) {
                        this.map[ this.keys[up] ] = map[key];
                    } else {
                        this.map[ up ] = map[key];
                    }
                }
            }
            if ( !this.bound ) {
                this.bound = true;
                $(document).bind('keydown', $.proxy(this.press, this));
            }
        },
        detach: function() {
            this.bound = false;
            this.map = {};
            $(document).unbind('keydown', this.press);
        }
    };
    Popup.prototype.slider = {
        timer: {},
        clear: function() {
            clearTimeout(this.timer);
        },
        set: function(instance) {
            this.clear();
            if (instance.isGroup) {
                this.timer = setTimeout($.proxy(instance.next,instance),instance.options.playSpeed);
            }  
        },
        play: function(instance) {
            instance.isPaused = false;
            this.set(instance);
        },
        pause: function(instance) {
            this.clear();
            instance.current.isPaused = true;
        }
    };

    $.extend(Popup, {
    	registerType: function() {},
        registerComponent: function(){}
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
            if (!$(this).data('popup')) {
                $(this).data('popup', new Popup(this, options)); 
            }
        }
    };

    // for history
    function parseHash(hash) {
        var arr = hash.split('/');
        return {
            id: hash.replace('#',''),
            index: parseInt(arr[2]) || 0
        }
    }

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

    // fixme: 'popup' use namespace
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

})(jQuery, document, window);