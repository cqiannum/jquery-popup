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
    var NAV = navigator.userAgent.toLowerCase(),
        HASH = window.location.hash.replace(/#\//, ''),
        pluginName = "Popup",
        doc = window.document,
        $doc = $(document),
        $win = $(window),
        resizeTimer = null,
        toString = Object.prototype.toString;
    var IE = (function() {
        var v = 3,
            div = window.document.createElement( 'div' ),
            all = div.getElementsByTagName( 'i' );

        do {
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
        } while ( all[0] );
        return v > 4 ? v : undefined;
    }() );
    var Util = {
        checkType: function(url) {
            var result = '',
                type = ['image','iframe','ajax','inline','swf','vhtml5'];

            $.each(type,function(i,v) {

                if (types[v].match) {
                    
                    if (types[v].match(url)) {
                        result = v;
                        return ;
                    }
                }
            });

            return result;
        },

        // parse anything into a number
        parseValue: function(val) {
            if (typeof val === 'number') {
                return val;
            } else if (typeof val === 'string') {
                var arr = val.match(/\-?\d|\./g);
                return arr && arr.constructor === Array ? arr.join('') * 1 : 0;
            } else {
                return 0;
            }
        },
        //check if the needed files have been loaded
        checkFile: function() {},
        loadfail: function(type) { // error process, image ajax iframe vhtml5

        }
    };
    var keyboard = {
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
    var browser = {
        // Browser helpers
        IE9: IE === 9,
        IE8: IE === 8,
        IE7: IE === 7,
        IE6: IE === 6,
        IE: IE,
        WEBKIT: /webkit/.test(NAV),
        CHROME: /chrome/.test(NAV),
        SAFARI: /safari/.test(NAV) && !(/chrome/.test(NAV)),
        QUIRK: (IE && doc.compatMode && doc.compatMode === "BackCompat"),
        MAC: /mac/.test(navigator.platform.toLowerCase()),
        OPERA: !! window.opera,
        IPHONE: /iphone/.test(NAV),
        IPAD: /ipad/.test(NAV),
        ANDROID: /android/.test(NAV),
        TOUCH: ('ontouchstart' in doc),

        MOBILE: /mobile/.test(NAV)
    };
    var slider = {
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
    var defaults = {
        width: 760,
        height: 428,
        
        buttomSpace: 0,
        leftSpace: 0,

        autoSize: true,
        closeBtn: true,
        winBtn: true,   //click overlay to close popup
        keyboard: true,

        autoPlay: false,
        playSpeed: 2000,
        hoverPause: true,

        preload: false,

        transition: 'fade',
        transitionSetting: {},
        sliderEffect: 'zoom',
        sliderSetting: {},

        //ajax config
        selector: null,
        ajax: {
            dataType: 'html',
            headers  : { 'popup': true } 
        },

        //swf config
        swf: {
            allowscriptaccess: 'always',
            allowfullscreen: 'true',
            wmode: 'transparent',
        },

        //vhtml5 config
        vhtml5: {
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
            source: [
                // {
                //     src: 'video/movie.mp4',
                //     type: 'mp4', // mpc,webm,ogv
                // },
                // {
                //     src: 'video/movie.webm',
                //     type: 'webm',
                // },
                // {
                //     src: 'video/movie.ogg',
                //     type: 'ogg',
                // }
            ],
        },

        tpl: {
            overlay: '<div class="popup-overlay"></div>',
            container: '<div class="popup-container"><div class="popup-content"><div class="popup-content-inner"></div></div><div class="popup-controls"></div></div>',
            iframe: '<iframe id="popup-frame{rnd}" name="popup-frame{rnd}" class="popup-iframe" frameborder="0" vspace="0" hspace="0"' + ' allowtransparency="true"' + '></iframe>',
            error: '<p class="popup-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
            loading: '<div class="popup-loading"></div>',
            closeBtn: '<a title="Close" class="popup-controls-close" href="javascript:;"></a>',
            next: '<a title="Next" class="popup-controls-next" href="javascript:;"><span></span></a>',
            prev: '<a title="Previous" class="popup-controls-prev" href="javascript:;"><span></span></a>'
        }
    };

    // Plugin constructor
    var Popup = $.Popup = function(data, options) {
        var dataPool;

        var options = options || {},
            self = this;

        //process on arguments
        var agms = arguments.length;

        // the flag of instance
        this.initialized = false;
        this.isGroup = null;
        this.active = false;
        this.isPaused = null;
        //dataPool is a database
        this.dataPool = {
            content: [], //thie could be set by plugin contains: type url info options loaded
            components: [], //this could be set by skin config
            skin: ''
        };
        dataPool = this.dataPool;

        this.index = 0;
        this.total = 0;
        this.type = '';
        this.url = '';

        //this value will be null,if the popup content is outside the page  
        this.elems = null;     
        this.target = null;

        this.options = options;
        this.current = null;
        this.coming = null;
        this.direction = null;
        this.mobile = browser.MOBILE;


        function init() {
            dataPool.skin = options.skin || 'skinRimless';
            var skin = skins[dataPool.skin];

            //content
            if (agms === 2) {
                if (toString.apply(data) === '[object Object]') {
                    dataPool.content.push(data);
                } else if (toString.apply(data) === '[object Array]') {
                    $.each(data, function(i, v) {
                        var obj = {};
                        if (toString.apply(v) === '[object String]') {
                            obj.type = Util.checkType(v);
                            obj.url = v;
                            dataPool.content.push(obj);
                        }
                        if (toString.apply(v) === '[object Object]') {
                            dataPool.content.push(v);
                        }
                    });
                }
                self.total = dataPool.content.length;
            } else if (agms === 1 || agms === 0) {
                alert('you need specific the popup source !');
            }
            
            if (self.mobile && skin.mobile) {
                self.current = $.extend(true, {},defaults, skin, skin.mobile, options);
            } else {
                self.current = $.extend(true, {},defaults, skin, options);
            }
            
            if (dataPool.content.length >= 2 || self.current.preload === true) {
                self.isGroup = true;
            }
           
            //component
            if (skin.components) {
                $.each(skin.components, function(key, value) {
                    var component = {};

                    if (value !== false) {
                        component.name = key;
                        if (toString.apply(value) === '[object Object]') { // component.options could be 'undefined' if not config
                            component.options = value;
                        }
                        dataPool.components.push(component);
                    }

                });

                // do for single item
                if(!self.isGroup) {
                    if (skin.single === undefined) {
                        skin.single = {
                            buttomSpace: 0,
                            leftSpace: 0
                        };
                    }


                    $.extend(self.current,skin.single);

                    if (skin.single.disabled) {
                        
                        $.each(dataPool.components,function(i,v) {
                            if (v === undefined) { 
                                return ;
                            }
                            var disable = $.inArray(v.name,skin.disabled);
                            if (disable) {
                                dataPool.components.splice(i,1);
                            }
                            console.log(v.name);
                        });
                    }
                }
                
            }
            self.initialized = true;
        }

        init();        
    };
    Popup.prototype = {
        constructor: Popup,
        _beforeshow: function() {
            var DOM,
                self = this,
                current = this.current,
                dataPool = this.dataPool,
                comps = dataPool.components,
                tpl = self.current.tpl;

            //save DOM rel
            this.$overlay = $(tpl.overlay);
            this.$container = $(tpl.container);
            this.$content = this.$container.find('.popup-content'); 
            this.$inner = this.$container.find('.popup-content-inner');  
            this.$close = $(tpl.closeBtn).appendTo(this.$container.find('.popup-controls'));  
            this.$loading = $(tpl.loading).css({display:'none'});

            this.$container.append(this.$loading);
            DOM = this.$overlay.add(this.$container);

            //gallery build
            if (this.isGroup) {
                this.$prev = $(tpl.prev);
                this.$next = $(tpl.next);
                this.$container.find('.popup-controls').append(this.$prev,this.$next);

                this.$prev.on('click',$.proxy(this.prev,this));
                this.$next.on('click',$.proxy(this.next,this));
            }

            //show overlay and container from tpl...
            this.$overlay.addClass(dataPool.skin).css({position:'fixed',opacity:0,top:0,left:0,width:'100%',height:'100%',zIndex:99990});
            this.$container.addClass(dataPool.skin).css({position:'fixed',opacity:0,top:'50%',left:'50%',zIndex:99991});
            DOM.appendTo($('body')); 

            //bound event
            if (current.winBtn === true) {
                this.$overlay.on('click.popup',$.proxy(this.close,this));
            }

            if (this.isGroup ===true && current.keyboard ===true) {
                keyboard.attach({
                    escape: $.proxy(this.close,this),
                    left: $.proxy(this.prev,this),
                    right: $.proxy(this.next,this)
                });
            }

            this.$close.on('click',$.proxy(this.close,this));
            $win.on('resize',$.proxy(this._resize,this));    

            // transitions
            transitions[current.transition]['openEffect'](this);   

            //show componnets
            $.each(comps, function(i, v) {
                components[v.name] && components[v.name].onReady(self,v.options);
            });
            

            //get container padding and border from css style
            this._wp = this.$container.outerWidth() - this.$inner.width();
            this._hp = this.$container.outerHeight() - this.$inner.height();

            console.log(this._wp);

            // //skin initial
            // skins[dataPool.skin]['init'] && skins[dataPool.skin]['init'](this);

            this.$container.trigger('beforeshow.popup');
        },
        show: function(index) {
            var data,
                dataPool = this.dataPool,
                comps = dataPool.components;

            index = index || 0;
            data = dataPool.content[index];

            this.index = index;
            this.type =  data.options && data.options.type || data.type;
            this.url = data.url;

            if (this.active === false) {
                this._beforeshow();
            }  

            //load content options
            if (data.options) { 
                this.current = $.extend(true,this.current,data.options);
            }
            
            this.$container.trigger('change.popup');

            // empty content before show another
            this._showLoading();

            this._load();
        },
        _load: function() {
            var self = this,
                comps = this.dataPool.components;

            types[this.type].load(this);

            //load componnets content
            $.each(comps, function(i, v) {
                components[v.name] && components[v.name].load && components[v.name].load(self);
            });

        },
        _afterLoad: function() {
            var to,
                current = this.current;

            if (!this._width && !this._height) {
                //set when type load error
                this._width = current.width;
                this._height = current.height;
            }              

            //for first open 
            if (this.active) {

                // sliderEffect
                sliderEffects[current.sliderEffect]['init'](this);
            } else {

                $(current.content).css({opacity:1});           
                this.$inner.append(current.content);
                this._hideLoading();
                this.resize();
            }     

            this.$container.trigger('afterLoad.popup');

            //add auto play
            if (current.autoPlay === true) {
                var self = this;
                slider.play(this);
                if (current.hoverPause === true) {
                    this.$container.on('mouseenter.popup',function(){
                        slider.pause(self);
                    });
                    this.$container.on('mouseleave.popup',function(){
                        slider.play(self);
                    })
                }
            }

            if (current.preload === true) {

                //todo: this excute prload function
                this.preload();
            }

            this.active = true;

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
        close: function() {
            var current = this.current;

            this.$container.trigger('close');

            //pause slider before close
            if (current.autoPlay === true) {
                slider.pause(this);

            }
            this.$container.off('.popup');

            keyboard.detach();
            
            //if there's not the transition,use the default           
            transitions[current.transition]['closeEffect'](this); 
                      
            
            this.active = false;
        },

        play: function() {},
        enable: function() {},
        disable: function() {},
        destroy: function() {
            this.close();
            if (this.elems) {
                this.elems.off('click.popup')
            }
            this.initialized = false;
        },
        _update: function() {
            this.total = this.dataPool.content.length;
        },


        //if calculate === true , not set container, just return a result
        resize: function(calculate) { 

            var current = this.current,
                buttomSpace = current.buttomSpace,
                leftSpace = current.leftSpace,
                boxWidth = this._width + this._wp,
                boxHeight = this._height + this._hp;

            //calculate
            var width = Math.min( $win.width()-leftSpace-20, boxWidth ),
                height = Math.min( $win.height()-buttomSpace-20, boxHeight ),
                ratio = Math.min( width / boxWidth, height / boxHeight ),
                destWidth = Math.round( boxWidth * ratio ),
                destHeight = Math.round( boxHeight * ratio ),
                to = {
                    width: Math.ceil(destWidth - this._wp),
                    height: Math.ceil(destHeight - this._hp),
                    marginTop: Math.ceil( destHeight / 2 ) *- 1 - Math.ceil( buttomSpace / 2 ),
                    marginLeft: Math.ceil( destWidth / 2 ) *- 1 + Math.ceil( leftSpace / 2 )
                };


            if (calculate === true) {
                 return to;
            } else {
                this.$container.css( to ); 
            }                     
        },

        //reduce event number
        _resize: function() {

            if (resizeTimer !== null) {
                clearTimeout(resizeTimer);
                resizeTimer = null;
            }

            resizeTimer = setTimeout($.proxy(this.resize,this), 10);
        },

        _hideLoading: function() {
            this.$loading.css({display:'none'});
        },

        _showLoading: function() {
            this.$loading.css({display:'block'});
        },
        preload: function() {
            //todo
        },

        //add component which is registered to current instance
        addComponent: function(name, options) {  
            var component = {};
            $.each(this.dataPool.components, function(i, v) {
                if (v.name === name) {
                    alert('this component has been added !')
                    return ' ';
                }
            });
            component.name = name;
            component.options = options;
            this.dataPool.components.push(component);
        },
        delComponent: function(name) {
            $.each(his.dataPool.components, function(i, v) {
                if (v.name === name) {
                    his.dataPool.components.splice(i, 1);
                }
            });
        }
    };

    //static method for the page

    $.extend(Popup, {

        //for plugin to get outside data
        run: function(selector,options) {
            $(selector).Popup(options);
        },
        
        // registered type cant be auto matched , it need manually add 
        registerType: function(name, options) {
            //forbid to register a exist type
            if (types[name]) { return ''; }

            types[name] = {};
            
            $.each(options,function(key,value) {
                types[name][key] = value;
            });

            //overwrite load method if it has load 
            if (types[name].load) {
                types[name].load = function(instance) {
                    //init before load
                    options.init && options.init(instance);

                    if (options.extends) {
                        types[options.extends].load(instance);
                    } else {
                        options.load(instance);
                    }
                };
            }           
        },
        registerSkin: function(name,options) {
            if (skins[name]) {
                alert('this skin is registered !');
            } else {
                skins[name] = options;
            }
        },
        registerComponent: function(name, options) {
            if(components[name]) { return }
            components[name] = options;
        }
    });

    //
    //  below object contains basic method and defaults for extending effect.
    //
    
    var skins = {
        defaults: {},
        skinRimless: {
            buttomSpace: 120,

            autoSize: true,
            sliderEffect: 'zoom',

            components: {
                thumbnail: true,
                infoBar: true,
            },

            //this ajust for single item
            single: {
                buttomSpace: 10,
                leftSpace: 0,
                disabled: ['thumbnail','infoBar']
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
        },        
    };

    var types = {
        image: {
            match: function(url) {
                return url.match(/\.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)$/i);
            },
            load: function(instance) {
                var img  = new Image();

                img.onload = function() {
                    var width = this.width,
                        height = this.height;

                    this.onload = this.onerror = null;

                    instance.current.image = {};
                    instance.current.image.width = width;
                    instance.current.image.height = height;
                    instance.current.image.aspect = width / height;

                    instance._width = width;
                    instance._height = height;

                    $(img).css({
                        width: '100.1%',
                        height: '100.1%',
                    });

                    instance.current.content = img;
                    instance._afterLoad();

                };

                img.onerror = function() {
                    this.onload = this.onerror = null;

                    alert('error')

                    instance.current.content = Util.loadfail('image');
                    instance._afterLoad();
                };

                if (img.complete === undefined || !img.complete) {
                    instance._showLoading();
                }

                img.src = instance.url;

            },
            preload: function(instance) {
                var group = Popup.group,
                    count = group.length,
                    obj;
                for (var i = 0; i < count; i += 1) {
                    obj = group[i];
                    new Image().src = obj.url;
                }
            }
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
                instance._afterLoad();
            }
        },
        ajax: {
            load: function(instance) {
                var content, current = instance.current;

                $.ajax($.extend({}, current.ajax, {
                    url: instance.url,
                    error: function() {
                        Util._loadfail('ajax');
                    },
                    success: function(data, textStatus) {
                        if (textStatus === 'success') {
                            instance._hideLoading();

                            // proceed data
                            if (current.selector) {
                                content = $('<div class="popup-ajax">').html(data).find(current.selector);
                            } else {
                                content = $('<div class="popup-ajax">').html(data);
                            }

                            current.content = content;


                            instance._afterLoad();
                        }
                    }
                }));
            }
        }
    };


    //transitions
    
    var transitions = {};

    transitions.fade = {
        defaults: {
            openSpeed: 500,
            closeSpeed: 500,
        },
        openEffect: function(instance) {
            var opts = $.extend({}, this.defaults, instance.current.transitionSetting);

            instance.$overlay.animate({opacity:1.0},{duration:opts.openSpeed});
            instance.$container.animate({opacity:1.0},{duration:opts.openSpeed});

        },
        // closeEffect need callback function
        closeEffect: function(instance) {
            var opts = $.extend({}, this.defaults, instance.current.transitionSetting);
                       
            instance.$overlay.fadeOut(opts.closeSpeed,function(){instance.$overlay.remove()});            
            instance.$container.fadeOut(opts.closeSpeed,function(){instance.$container.remove()});  

        },
    };

    
    //components 

    var components = {};  

    // jQuery plugin initialization 
    $.fn.Popup = function(options) {
        var self = this;

        if (typeof options === 'string') {
            var api = $(this)[0].data('popup'),
                method = options;

            //return when there is not elems
            if (api.length === 0) {
                return ;
            }
                
            switch (method) {
                case 'show':
                    api.show();
                    break;
                case 'close':
                    api.close();
                    break;
                case 'enable':
                    api.enable();
                    break;
                case 'disable':
                    api.disable();
                    break;
            }
        }

        function run(instance) {
            var start;
            $(instance).on('click.popup', function(e) {
                var index,group = {},
                    data = [], metas = {};
                
                //get user options on DOM protperties and store them on metas object
                $.each($(instance).data(), function(k, v) {
                    if (/^popup/i.test(k)) {
                        metas[k.toLowerCase().replace(/^popup/i, '')] = v;
                    }
                });    

                //filter the same popup-group name with the current click element as a group
                group = self.filter(function() {
                    var data = $(this).data('popup-group');
                    if (metas.group) {
                        return data === metas.group;
                    }
                });  


                if (group.length === 0) {
                    group = this;
                    data.push({
                        url: $(this).attr('href'),
                        type: Util.checkType($(this).attr('href')),
                        options: metas
                    });

                } else {
                    $.each(group, function(i, el) {
                        var url = $(el).attr('href'),
                            source = {},
                            metas = {};

                        // if doesnot have src property, ignore the element
                        if (url) {
                            source.url = url;
                            source.type = Util.checkType(url);
                        } else {
                            alert('cant find url in the element');
                        }

                        //get user options on DOM protperties and store them on metas object
                        $.each($(el).data(), function(k, v) {
                            if (/^popup/i.test(k)) {
                                metas[k.toLowerCase().replace(/^popup/i, '')] = v;
                            }
                        });

                        source.options = metas;
                        data.push(source);
                    });
                }

                index = $(group).index(instance); 

                start = new Popup(data, options);
                start.elems = group;
                start.target = this;

                if ( group.length >= 2 ) {
                    start.isGroup = true;
                }

                start.show(index);

                return false;
            });
            return start;
        }      

        return self.each(function() {
            if (!$.data(self, 'popup')) {
                $.data(self, 'popup', run(this));
            }
        });
    };

})(jQuery, document, window);

$.Popup.registerComponent('infoBar',{
    defaults: {
        tpl: {
            wrap: '<div class="popup-infoBar"></div>',
            title: '<span class="popup-title"></span>',
            count: '<span class="popup-count"></span>'
        }
    },
    opts: {},
    onReady: function(instance,options) {
        var opts = $.extend(true,this.opts,this.defaults,options),
            tpl = opts.tpl;
        console.log('infoBar')

        this.$title = $(tpl.title);
        this.$count = $(tpl.count);
        this.$wrap = $(tpl.wrap).append(this.$title).append(this.$count).appendTo(instance.$container);
    },
    load: function(instance) {

        this.$title.text(instance.current.title);
        this.$count.text( (instance.index+1) + "/" + instance.total);


    },
    close: function(){}
});

$.Popup.registerSkin('skinSimple',{
    buttomSpace: 140,
    leftSpace: 0,

    autoSize: true,
    sliderEffect: 'zoom',

    components: {
        thumbnail: true,
        infoBar: true,
    },

    //this ajust for single item
    single: {
        buttomSpace: 10,
        leftSpace: 0,
        disabled: ['thumbnail']
    },
    
    //ajust layout for mobile device
    mobile: {
        buttomSpace: 0,
        components: {
            thumbnail: false,
            infoBar: true
        }
    }
});


