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

    // Plugin constructor
    var Popup = $.popup = function(element, options) {
        this.element = element;
        this.$element = $(element);

        // for cache html constructor
        this.initialized = false;  

        // for gallery
        this.active = false;

        this.isGroup = null;

        this.isPaused = null;

        this.group = [];

        this.index = 0;
        this.total = 0;
        this.type = '';
        this.url = '';

        this.target = null;

        this.options = options;

        this.init();        
    };

    Popup.prototype = {
        constructor: Popup,

        themes: {},
        types: {},
        transitions: {},
        effects: {},

        slider: {},
        keyboard: {},

        init: function() {
            var theme = this.themes[this.options.theme], 
                self = this;

            if (this.mobile && theme.mobile) {
                this.options = $.extend(true, {}, Popup.defaults, theme, theme.mobile, this.options);
            } else {
                this.options = $.extend(true, {}, Popup.defaults, theme, this.options);
            }

            this.$element.on('click', function() {
                var metas = {}, group, index;

                metas.group = $(this).data('popup-group');

                group = self.filterGroup(metas.group, self.$element);
                
                self.group = self.getGroupConfig.call(self, group);

                index = $(group).index(this);
                self.target = this;

                if (group.length > 1) {
                    self.isGroup = true;
                }

                self.show(index); 

                return false;
            });

            this.initialized = true;
        },
        

        create: function() {
            var DOM,
                self = this,
                options = this.options,
                dataPool = this.dataPool,
                comps = dataPool.components,
                tpl = self.options.tpl;

            //save DOM rel
            this.$overlay = $(tpl.overlay);
            this.$container = $(tpl.container);
            this.$content = this.$container.find('.popup-content'); 
            this.$inner = this.$container.find('.popup-content-inner');  
            this.$close = $(tpl.closeBtn).appendTo(this.$container.find('.popup-controls'));  
            this.$loading = $(tpl.loading);

            this.$container.append(this.$loading);
            DOM = this.$overlay.add(this.$container);

            // gallery build
            if (this.isGroup) {
                this.$prev = $(tpl.prev);
                this.$next = $(tpl.next);
                this.$container.find('.popup-controls').append(this.$prev,this.$next);

                this.$prev.on('click',$.proxy(this.prev,this));
                this.$next.on('click',$.proxy(this.next,this));
            }

            // show overlay and container from tpl...
            // TODO: position fixed may cause issue in mobile gesture, change to absolute
            this.$overlay.addClass(dataPool.theme);
            this.$container.addClass(dataPool.theme);
            DOM.appendTo($('body')); 

            // bound event
         

            if (this.isGroup ===true && options.keyboard ===true) {
                this.keyboard.attach({
                    escape: $.proxy(this.close,this),
                    left: $.proxy(this.prev,this),
                    right: $.proxy(this.next,this)
                });
            }

            this.$close.on('click',$.proxy(this.close,this));   
            this.$container.on('click.popup',function(e) {
                self.close();
            });

            
            //show componnets
            $.each(comps, function(i, v) {
                if (self.components[v.name]) {
                    self.components[v.name].init(self, v.options);
                }
            });           

            this.$overlay.trigger('open.popup');
        },
        show: function(index) {
            var item;

            index = index || 0;
            item = this.group[index];

            this.setCurrentInfo(item);

            //load content options
            if (item.options) { 
                this.settings = $.extend(true, {}, this.options, data.options);
            }

            // empty content before show another
            this.showLoading();

            // load content
            this.types[this.type].load(this);

            this.update();
            this.afterLoad();      
        },
    
        checkType: function(url) {
            var result = '',
                self = this,
                type = ['image','iframe','ajax','inline','swf','vhtml5'];

            $.each(type,function(i,v) {
                if (self.types[v].match) {
                    if (self.types[v].match(url)) {
                        result = v;
                        return ;
                    }
                }
            });

            return result;
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
                        type: this.options.type || self.checkType(url) 
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
        setCurrentInfo: function(item) {

            if (item === null) {
                return;
            }

            this.total = this.group.length;
            this.index = this.$element.index(item);
            this.type = '';
            this.url = '';
            this.target = item;
        },

        update: function($content) {
            if (this.active === false) {
                this.create();
            } else {
                this.active = true;
            }
            $content.appendTo(this.$content);

            this.$container.trigger('change.popup', this);
        },

        afterLoad: function() {
            var current = this.current;   

            if (this.active) {               
                this.$inner.append(current.content);
                this.hideLoading();

                this.$container.addClass(this.namespace + '-transition-' + this.options.transition);

                //add auto play
                if (current.autoPlay === true) {
                    var self = this;
                    this.slider.play(this);
                    if (current.hoverPause === true) {
                        this.$container.on('mouseenter.popup',function(){
                            self.slider.pause(self);
                        });
                        this.$container.on('mouseleave.popup',function(){
                            self.slider.play(self);
                        });
                    }
                }

            } else {
                this.$container.addClass(this.namespace + '-effect-' + this.options.effect);
                this.$container.trigger('change.popup', this); 
            }           
        },
        next: function() {
            var index = this.index;
            index++;
            if (index >= this.total) {
                index = 0;
            }

            this.direction = 'next';
            this.show(index);
        }, 
        prev: function() {
            var index = this.index;
            index--;
            if (index < 0) {
                index = this.total - 1;
            }
            this.direction = 'prev';
            this.show(index);
        },
        cancel: function() {
            this.hideLoading();
        },
        close: function() {
            var current = this.current;

            this.$overlay.trigger('close.popup');

            //pause slider before close
            if (current.autoPlay === true) {
                this.slider.pause(this);
            }
            this.$container.off('.popup');

            this.keyboard.detach();
            
            //if there's not the transition,use the default           
            if (!this.css3Transition) {
                this.transitions[current.transition]['closeEffect'](this);
            }                      
            
            this.active = false;
        },
        destroy: function() {
            this.close();
            if (this.elems) {
                this.elems.off('click.popup');
            }
            this.initialized = false;
        },

        hideLoading: function() {
            this.$loading.css({display:'none'});
        },

        showLoading: function() {
            this.$loading.css({display:'block'});
        }
    };

    $.extend(Popup, {

        //for plugin to get outside data
        defaults: {

            namespace: 'popup',

            winBtn: true,  
            keyboard: true,

            autoPlay: false,
            playSpeed: 2000,
            hoverPause: true,

            preload: false,

            disableOn: function() {
                return false;
            },

            tpl: {
                overlay: '<div class="popup-overlay"></div>',
                container: '<div class="popup-container"><div class="popup-content"></div><div class="popup-controls"></div></div>',
                loading: '<div class="popup-loading"></div>',
                close: '<a title="Close" class="popup-controls-close" href="javascript:;"></a>',
                next: '<a title="Next" class="popup-controls-next" href="javascript:;"><span></span></a>',
                prev: '<a title="Previous" class="popup-controls-prev" href="javascript:;"><span></span></a>'
            }
        },
        
        // registered type cant be auto matched , it need manually add 
        registerType: function(name, options) {
            var types = Popup.prototype.types;

            //forbid to register a exist type
            if (types[name]) { 
                throw new Error('this Type has registered, please use another name. '); 
            }

            types[name] = {};
            
            $.each(options,function(key,value) {
                types[name][key] = value;
            });

            //overwrite load method if it has load 
            if (types[name].load) {
                types[name].load = function(instance) {
                    //init before load
                    if ($.type(options.init) === 'function') {
                        options.init(instance);
                    }

                    if (options.extends) {
                        types[options.extends].load(instance);
                    } else {
                        options.load(instance);
                    }
                };
            }           
        },
        registertheme: function(name,options) {
            if (Popup.prototype.themes[name]) {
                throw new Error('this theme is registered !');
            } else {
                Popup.prototype.themes[name] = options;
            }
        },
        registerComponent: function(name, options) {
            if(Popup.prototype.components[name]) { 
                throw new Error('this component is registered !');
            }
            Popup.prototype.components[name] = options;
        }
    });
    
    Popup.prototype.themes = {
        themeRimless: {
            buttomSpace: 120,

            autoSize: true,
            sliderEffect: 'zoom',

            components: {
                thumbnail: true,
                infoBar: true
            },

            //ajust layout for mobile device
            mobile: {
                buttomSpace: 10,
                leftSpace: 0,
                components: {
                    thumbnail: false,
                    infoBar: true
                }
            }
        }        
    };

    Popup.prototype.types = {
        image: {
            match: function(url) {
                return url.match(/\.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)$/i);
            },
            getSize: function(img, callback) {
                var counter = 0,
                    img = item.img[0],
                    interval = function(delay) {

                        if(_imgInterval) {
                            clearInterval(_imgInterval);
                        }
                        // decelerating interval that checks for size of an image
                        _imgInterval = setInterval(function() {
                            if(img.naturalWidth > 0) {
                                mfp._onImageHasSize(item);
                                return;
                            }

                            if(counter > 200) {
                                clearInterval(_imgInterval);
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
            load: function(instance, dtd) {
                var self = this,
                    img  = new Image();

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

                img.src = instance.url;

                this.getSize(img, function() {
                    if($.type(dtd.resolve) === 'function') {
                        dtd.resolve();
                    } else {
                        throw new Error('dtd is not a deferred object !');
                    } 
                });
            },
        },
        inline: {
            match: function(url) {
                return url.charAt(0) === "#";
            },
            load: function(instance) {
                var $inline = $(instance.url).clone().css({
                    'display': 'inline-block' //fix top space issue
                });

                instance.current.content = $('<div class="popup-inline">').append($inline);
                instance.afterLoad();
            }
        },
        vhtml5: {
            match: function(url) {
                return url.match(/\.(mp4|webm|ogg)$/i);
            },
            load: function(instance) {
                var $video,
                    index, type, arr,
                    source = '', 
                    url = instance.url,
                    vhtml5 = instance.current.vhtml5;

                $video = $('<video class="popup-content-video">').attr({
                    width: '100%',
                    height: '100%',
                    preload: vhtml5.preload,
                    controls: vhtml5.controls,
                    poster: vhtml5.poster
                });

                arr = url.split(',');

                //get videos address from url
                if(arr.length !== 0) {
                    $.each($(arr), function(i, v) {
                        var type;
                        type = $.trim(v.split('.')[1]);
                        source += '<source src="' + v + '" type="' + vhtml5.type[type] + '"></source>';
                    });
                }

                //get videos address from options
                if (vhtml5.source.length !== 0) {
                    $.each(vhtml5.source, function(i, arr) {
                        source += '<source src="' + arr.src + '" type="' + vhtml5.type[arr.type] + '"></source>';
                    });
                }
                
                $(source).appendTo($video);
                instance.current.content = $video;
                instance.afterLoad();
            }
        },
        swf: {
            match: function(url) {
                return url.match(/\.(swf)((\?|#).*)?$/i);
            },
            load: function(instance) {
                var $object, $swf, content = '',
                    embed = '',
                    current = instance.current,
                    swf = current.swf;   

                $object = $('<object class="popup-content-object" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + instance.url + '"></param></object>');

                $.each(swf, function(name, val) {
                    content += '<param name="' + name + '" value="' + val + '"></param>';
                    embed += ' ' + name + '="' + val + '"';
                });

                $(content).appendTo($object);

                $swf = $('<embed src="' + instance.url + '" type="application/x-shockwave-flash"  width="100%" height="100%"' + embed + '></embed>').appendTo($object);

                instance.current.content = $object;

                instance.afterLoad();
            }
        },
        //you should set type when using iframe && ajax,they cant auto match, 
        iframe: {
            match: function(url) {
                if (url.match(/\.(ppt|PPT|tif|TIF|pdf|PDF)$/i)) {
                    return true;
                }
            },
            load: function(instance) {
                var $iframe,
                    iframe = instance.current.tpl.iframe; 

                //$iframe
                $iframe = $(iframe).css({
                    'width': '100%',
                    'height': '100%',
                    'border': 'none'
                }).attr('src', instance.url);

                instance.current.content = $iframe;
                instance.afterLoad();
            }
        },
        ajax: {
            load: function(instance) {
                var content, current = instance.current;

                $.ajax($.extend({}, current.ajax, {
                    url: instance.url,
                    error: function() {
                        // to do 
                    },
                    success: function(data, textStatus) {
                        if (textStatus === 'success') {
                            instance.hideLoading();

                            // proceed data
                            if (current.selector) {
                                content = $('<div class="popup-ajax">').html(data).find(current.selector);
                            } else {
                                content = $('<div class="popup-ajax">').html(data);
                            }

                            current.content = content;


                            instance.afterLoad();
                        }
                    }
                }));
            }
        }
    };

    Popup.prototype.transitions = {
        fade: {
            defaults: {
                openSpeed: 500,
                closeSpeed: 500
            },
            openEffect: function(instance, callback) {
                var opts = $.extend({}, this.defaults, instance.current.transitionSetting);

                instance.$overlay.animate({opacity:1.0},{duration:opts.openSpeed});
                instance.$container.animate({opacity:1.0},{duration:opts.openSpeed});

            },
            // closeEffect need callback function
            closeEffect: function(instance, callback) {
                var opts = $.extend({}, this.defaults, instance.current.transitionSetting);
                
                // callback = function(){instance.$container.remove()      
                instance.$overlay.fadeOut(opts.closeSpeed, callback);            
                instance.$container.fadeOut(opts.closeSpeed, callback);  

            }
        }
    };

    Popup.prototype.effects = {
        zoom: {
            defaults: {
                duration: 200,
                easing: 'linear'
            },
            init: function(instance, callback) {
                var rez,
                    current = instance.current,
                    buttomSpace = current.buttomSpace,
                    leftSpace = current.leftSpace,
                    opts = $.extend({}, this.defaults, current.sliderSetting);

                instance.$inner.empty();    
                rez = $.proxy(instance.resize,instance)(true);  

                instance.$container.stop().animate( rez ,{
                    duration: opts.duration,
                    easing: opts.easing,
                    complete: function() {
                        instance.$inner.append(current.content); 
                        instance.hideLoading.apply(instance);
                        $(current.content).animate({opacity:1},opts.duration);
                       
                    }
                });

            
                // // css3 transition
                // instance.$container.css( rez ); 
                // setTimeout(function(){
                //     $(current.content).css({opacity:0});
                //     instance.$inner.append(current.content); 
                //     instance.hideLoading.apply(instance);
                
                //     $(current.content).animate({opacity:1},opts.duration)   
                     
                // },200); 
                
            }
        },
        slide: {
            defaults: {
                easing:'swing',
                duration: 200
            },
            init: function(instance) {
                var current   = instance.current,
                    opts = $.extend({}, this.defaults, current.sliderSetting),
                    rez = $.proxy(instance.resize,instance)(true),
                    startPos  = $.extend({},rez),
                    dispear = {opacity: 0},               
                    direction = instance.direction,
                    distance  = 200,
                    field     = 'marginLeft',
                    clone;
                  
                clone = instance.$container.clone().appendTo($('body'));
                instance.$container.css({display: 'none'});

                if (direction === 'next') {
                    startPos[field] = startPos[field] + distance + 'px';
                    dispear[field] = '-=' + distance + 'px';
                } else {
                    startPos[field] = startPos[field] - distance + 'px';
                    dispear[field] = '+=' + distance + 'px';
                }

                clone.animate(dispear,{
                    duration : 200,
                    easing   : 'linear',
                    complete : function() {
                        clone.remove();
                    }
                });   
               
                instance.hideLoading();
                $(current.content).css({opacity:1});
                instance.$inner.empty().append(current.content);
                startPos.opacity = 0.1;
                startPos.display = 'block';

                rez.opacity = 1;

                instance.$container.css(startPos).animate(rez,{
                    duration : opts.duration,
                    easing   : opts.easing
                });
            }
        }
    };

    Popup.prototype.silder = {
        timer: {},
        clear: function() {
            clearTimeout(this.timer);
        },
        set: function(instance) {
            this.clear();
            if (instance.isGroup) {
                this.timer = setTimeout($.proxy(instance.next,instance),instance.current.playSpeed);
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
            if ( key in keyboard.map && typeof keyboard.map[key] === 'function' ) {
                keyboard.map[key].call(self, e);
            }
        },
        attach: function(map) {
            var key, up;
            for( key in map ) {
                if ( map.hasOwnProperty( key ) ) {
                    up = key.toUpperCase();
                    if ( up in keyboard.keys ) {
                        keyboard.map[ keyboard.keys[up] ] = map[key];
                    } else {
                        keyboard.map[ up ] = map[key];
                    }
                }
            }
            if ( !keyboard.bound ) {
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


    // jQuery plugin initialization 
    $.fn.Popup = function(options) {
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

// $.popup.registerComponent('thumbnail',{
//     defaults: {
//         count: 5,
//         unitWidth: 80,
//         unitHeight: 80,
//         bottom: 16,
//         left: 0,
//         padding: 0, //for border
//         gap: 20,

//         //todo: adapt media list
//         meida: ['screen','ipad'],
//         tpl: {
//             wrap:'<div class="popup-thumbnails"><div class="popup-thumbnails-holder"></div></div>',
//             holder: '<div class="popup-thumbnails-holder"></div>',
//             inner: '<div class="popup-thumbails-inner"></div>',
//             item: '<a class="thumb-loading" href="javascript:;"><span></span></a>',
//             next: '<a title="Next" class="popup-thumbnails-next" href="javascript:;"></a>',
//             prev: '<a title="Previous" class="popup-thumbnails-prev" href="javascript:;"></a>'
//         },
//         map: {
//             none: '',
//             iframe: '',
//             ajax: '',
//             vhtml5: ''
//         }
//     },  
//     loaded: null, 
//     opts: {},
//     thumbChunk: [],
//     build: function() {
//         var tpl = this.opts.tpl;

//         this.$wrap = $(tpl.wrap);
//         this.$holder = $(tpl.holder);
//         this.$inner = $(tpl.inner).appendTo(this.$holder);
//         this.$prev = $(tpl.prev);
//         this.$next = $(tpl.next);

//         //this.$inner.css({position:'absolute',top:0,left:0});

//         var self = this;
//         $.each(this.thumbChunk,function(i,v) {
//             $(tpl.item).appendTo(self.$inner);
//         });

//         this.$prev.add(this.$holder).add(this.$next).appendTo(this.$wrap);

//         this.$wrap.appendTo($('.popup-container'));
//     },
//     addChunk:function(chunks) {
//         var thumbChunk = this.thumbChunk;
//         $.each(chunks,function(i,v) {
//             thumbChunk.push(v);
//         });
//     },
//     active: function(index) {
//         var act = 'popup-thumbnail-active';
//         this.$holder.find('.popup-thumbnail-active').removeClass(act);
//         this.$holder.find('a').eq(index).addClass(act);

//         this.resetPos(index);
//     },
//     _position: function(options) {
//         var opts = this.opts,
//             top, showWidth,totalWidth,
//             unitWidth = opts.unitWidth,
//             unitHeight = opts.unitHeight,
//             bottom = opts.bottom,
//             left = opts.left,
//             padding = opts.padding,
//             gap = opts.gap,
//             count = opts.count,
//             n = this.thumbChunk.length;

//         count = count > n ? n : count; 
//         showWidth = opts.showWidth = count * (unitWidth+2*padding) + (count-1)*gap;

//         this.$wrap.css({
//             'position': 'fixed',
//             'bottom': bottom,
//             'left': left,
//         });
//         this.$holder.css({
//             'width': showWidth, 
//             'height': unitHeight + 2* padding
//         });
//         this.$inner.css({
//             'width': n * (unitWidth+2*padding) + (n -1)*gap
//         });
//     }, 
//     resetPos: function(index) {
//         var $inner = this.$inner,
//             opts = this.opts,
//             showWidth = this.opts.showWidth,
//             len = (index +1)*(opts.unitWidth+2*opts.padding) + index*opts.gap,
//             left = parseInt($inner.css('left')); 

//         if (left+len-showWidth > 0) {
//             left = showWidth - len;
//         } else if (left + len < 0) {
//             left = this.opts.unitWidth + 2*this.opts.padding - len;
//         }

//         $inner.css({
//             'left': left,
//         });
//     },
//     move: function(direction) {
//         var $inner = this.$inner,
//             left =  parseInt($inner.css('left')),
//             showWidth = parseInt(this.opts.showWidth),
//             totalWidth = parseInt($inner.width());

//         if (direction == 'left') {
//             var leng = left-showWidth <= 0 ? 0: (left-showWidth);
//             console.log(leng)

//             $inner.css({
//                 'left': left-showWidth <= 0 ? 0: (left-showWidth)
//             });
//         } else {
//             var wid = -(left+showWidth>totalWidth-showWidth ? totalWidth-showWidth:left+showWidth);
//             console.log($inner.css('left'))
//             console.log(showWidth)
//             console.log(totalWidth)
//             console.log(wid)

//             $inner.css({
//                 'left': -(left+showWidth>totalWidth-showWidth ? totalWidth-showWidth:left+showWidth)
//             });
//         }
//     },

//     //main 
//     onReady: function(instance,options) {
//         var $items,
//             self = this,
//             chunks = [],
//             data = instance.dataPool.content,
//             opts = $.extend(true,this.opts,this.defaults,options);

//         //here add thumbnail
//         $.each(data,function(key,value) {
//             if (value.thumb) {
//                 chunks.push(value.thumb);
//             } else {
//                 if (value.type === "image") {
//                     chunks.push(value.url);
//                 } else if (opts.map[value.type]) {
//                     chunks.push(opts.map[value.type]);
//                 } else {
//                     chunks.push(opts.map['none']);
//                 }
//             }
//         });



//         this.addChunk(chunks);


//         this.build();  


//         $items = this.$holder.find('a');  

//         this._position();

//         //add to DOM

//         this.active(instance.index);     

//         this.$prev.on('click',function() { $.proxy(self.move,self)('left'); });
//         this.$next.on('click',function() { $.proxy(self.move,self)('right'); });
//         this.$holder.delegate('a','click',function(event) {
//             var index = $items.index(event.currentTarget);
//             instance.show(index);
//         });

//         instance.$container.on('change.popup',function() {
//             self.active(instance.index);
//         });
//         instance.$container.on('dataChange.popup',function(arr) {
//             //maybe it need some work
            
//             $.proxy(self.addChunk,self)(arr);
//         });
//         instance.$container.on('close.popup',$.proxy(self.close,self));
//     },
//     load: function(instance) {
//         var $items = this.$holder.find('a');
       
//         $.each(this.thumbChunk,function(i,v) {
//             $('<img />').load(function() {
//                 $items.eq(i).removeClass('thumb-loading').append($(this));
//             }).error(function() {
//                 $items.eq(i).removeClass('thumb-loading').append($(this));
//             }).attr('src', v);
//         });  

//         this.loaded = true;
//     },
//     close: function(){
//         this.$prev.off('click');
//         this.$next.off('click');
//         this.$holder.off('click');

//         this.loaded = false;
//         this.thumbChunk = [];
//     }
// });

// $.popup.registerComponent('infoBar',{
//     defaults: {
//         tpl: {
//             wrap: '<div class="popup-infoBar"></div>',
//             title: '<span class="popup-title"></span>',
//             count: '<span class="popup-count"></span>'
//         }
//     },
//     opts: {},
//     onReady: function(instance,options) {
//         var opts = $.extend(true,this.opts,this.defaults,options),
//             tpl = opts.tpl;
//         console.log('infoBar')

//         this.$title = $(tpl.title);
//         this.$count = $(tpl.count);
//         this.$wrap = $(tpl.wrap).append(this.$title).append(this.$count).appendTo(instance.$container);
//     },
//     load: function(instance) {

//         this.$title.text(instance.current.title);
//         this.$count.text( (instance.index+1) + "/" + instance.total);


//     },
//     close: function(){}
// });

// $.popup.registertheme('themeSimple',{
//     buttomSpace: 140,
//     leftSpace: 0,

//     autoSize: true,
//     sliderEffect: 'zoom',

//     components: {
//         thumbnail: true,
//         infoBar: true,
//     },

//     //this ajust for single item
//     single: {
//         buttomSpace: 10,
//         leftSpace: 0,
//         disabled: ['thumbnail']
//     },
    
//     //ajust layout for mobile device
//     mobile: {
//         buttomSpace: 0,
//         components: {
//             thumbnail: false,
//             infoBar: true
//         }
//     }
// });


