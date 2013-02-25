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
        TOUCH: ('ontouchstart' in doc)
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
            iframe: '<iframe id="popup-frame{rnd}" name="popup-frame{rnd}" class="popup-iframe" frameborder="0" vspace="0" hspace="0"' + ($.browser.msie ? ' allowtransparency="true"' : '') + '></iframe>',
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
            
            
            self.current = $.extend(true, {},defaults, skin, options);
           
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

                self.initialized = true;
            }
        }

        init();

        if (dataPool.content.length >= 2 || this.current.preload === true) {
            this.isGroup = true;
        }
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
            this.$inner = this.$container.find('.popup-content-inner');  
            this.$close = $(tpl.closeBtn);  
            this.$loading = $(tpl.loading).css({display:'none'});

            this.$container.append(this.$loading);
            DOM = this.$overlay.add(this.$container,this.$close);

            //gallery build
            if (this.isGroup) {
                this.$prev = $(tpl.prev);
                this.$next = $(tpl.next);
                this.$container.find('.popup-controls').append(this.$prev,this.$next);

                this.$prev.on('click',$.proxy(this.prev,this));
                this.$next.on('click',$.proxy(this.next,this));
            }

            //show overlay and container from tpl...
            this.$overlay.addClass(dataPool.skin).css({position:'fixed',display:'none',top:0,left:0,width:'100%',height:'100%',zIndex:99990});
            this.$container.addClass(dataPool.skin).css({position:'fixed',display:'none',top:'50%',left:'50%',zIndex:99991});
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
            if (this.isGroup) {
                $.each(comps, function(i, v) {
                    components[v.name].onReady(self,v.options);
                });
            }
            

            //get container padding and border from css style
            this._wp = this.$container.outerWidth() - this.$container.width();
            this._hp = this.$container.outerHeight() - this.$container.height();

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
            //this.$inner.empty();
            this._showLoading();
            
            this._load();
        },
        _load: function() {
            var comps = this.dataPool.components;

            types[this.type].load(this);

            //load componnets content
            $.each(comps, function(i, v) {
                components[v.name].load && components[v.name].load(this);
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
 

            if (this.active) {

                // sliderEffect
                sliderEffects[current.sliderEffect]['init'](this);
            } else {
                //for first open     
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

            this.show(index);
        },
        prev: function() {
            var index = this.index;
            index--;
            if (index <= 0) {
                index = this.total - 1;
            }
            this.show(index);
        },
        close: function() {
            var current = this.current;

            this.$container.trigger('close');

            //pause slider before close
            if (current.autoPlay === true) {
                slider.pause(this);

            }
            
            //if there's not the transition,use the default           
            transitions[current.transition]['closeEffect'](this); 
                      
            this.$container.off('.popup');

            keyboard.detach();
            this.active = false;
        },

        //add outside data
        addData: function(arr) {
            var len = arr.length;
            //push data to data pool
            $.each(arr,function(i,v){
                //change to datapool kind
                //check type then update instance


                this._update();
            });

            //design for component to use new data
            this.$container.trigger('dataChange.popup',arr);
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
            var width = Math.min( $win.width()-leftSpace-40, boxWidth ),
                height = Math.min( $win.height()-buttomSpace-40, boxHeight ),
                ratio = Math.min( width / boxWidth, height / boxHeight ),
                destWidth = Math.round( boxWidth * ratio ),
                destHeight = Math.round( boxHeight * ratio ),
                to = {
                    width: destWidth,
                    height: destHeight,
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
                thumbnail: true
            },

            //ajust layout for mobile device
            _mobile: {}
        }
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
                    'display': 'block'
                });

                instance.$inner.empty();

                instance.current.content = $('<div class="popup-inline">').append($inline);
                instance._afterLoad();
            }
        },
        vhtml5: {
            match: function(url) {
                return url.match(/\.(mp4|webm|ogg)$/i);
            },
            load: function(instance) {
                var $video,
                    source, index, type, arr,
                    url = instance.url,
                    vhtml5 = instance.current.vhtml5;

                $video = $('<video class="popup-content-video">').attr({
                    width: '100%',
                    height: '100%',
                    preload: vhtml5.preload,
                    controls: vhtml5.controls,
                    poster: vhtml5.poster,
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

                instance.$inner.empty();

                instance.current.content = $video;

                instance._afterLoad();
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

                instance.$inner.empty();

                instance.current.content = $object;

                instance._afterLoad();
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

                instance.$inner.empty();

                instance.current.content = $iframe;
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

                            instance.$inner.empty();

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

            instance.$overlay.fadeIn(opts.openSpeed);
            instance.$container.fadeIn(opts.openSpeed);

        },
        // closeEffect need callback function
        closeEffect: function(instance) {
            var opts = $.extend({}, this.defaults, instance.current.transitionSetting);
                       
            instance.$overlay.fadeOut(opts.closeSpeed,function(){instance.$overlay.remove()});            
            instance.$container.fadeOut(opts.closeSpeed,function(){instance.$container.remove()});         
        },
    };
    
    //slider

    var sliderEffects = {};

    sliderEffects.zoom = {
        defaults: {
            duration: 200,
            easing: 'linear',
        },
        init: function(instance) {
            var rez,
                current = instance.current,
                buttomSpace = current.buttomSpace,
                leftSpace = current.leftSpace,
                opts = $.extend({}, this.defaults, current.sliderSetting);


            instance.$inner.empty();    
            rez = $.proxy(instance.resize,instance)(true);    
             
            /*
            // css3 transition
            instance.$container.css( rez ); 
            setTimeout(function(){
                $(current.content).css({opacity:0});
                instance.$inner.append(current.content); 
                instance._hideLoading.apply(instance);
            
                $(current.content).css({opacity:1});   
                console.log($(current.content)) 
            },200); 
            */
            

            instance.$container.stop().animate( rez ,{
                duration: opts.duration,
                easing: opts.easing,
                complete: function() {
                    instance.$inner.append(current.content); 
                    instance._hideLoading.apply(instance);
                    $(current.content).animate({opacity:1},opts.duration)
                    //$(current.content).addClass('fadeIn');
                }
            });
        }
    };

    //this style need fix dimension of container
    sliderEffects.slide = {
        defaults: {
            duration: 200
        },
        init: function(instance) {

        }
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

$.Popup.registerComponent('thumbnail',{
    defaults: {
        count: 5,
        unitWidth: 80,
        unitHeight: 80,
        bottom: 16,
        left: 0,
        padding: 0, //for border
        gap: 20,

        //todo: adapt media list
        meida: ['screen','ipad'],
        tpl: {
            wrap:'<div class="popup-thumbnails"></div>',
            holder: '<div class="popup-thumbnails-holder"></div>',
            inner: '<div class="popup-thumbails-inner"></div>',
            item: '<a class="thumb-loading" href="javascript:;"><span></span></a>',
            next: '<a title="Next" class="popup-thumbnails-next" href="javascript:;"></a>',
            prev: '<a title="Previous" class="popup-thumbnails-prev" href="javascript:;"></a>'
        },
        map: {
            none: '',
            iframe: '',
            ajax: '',
            vhtml5: ''
        }
    },  
    loaded: null, 
    opts: {},
    thumbChunk: [],
    build: function() {
        var tpl = this.opts.tpl;

        this.$wrap = $(tpl.wrap);
        this.$holder = $(tpl.holder);
        this.$inner = $(tpl.inner).appendTo(this.$holder);
        this.$prev = $(tpl.prev);
        this.$next = $(tpl.next);

        var self = this;
        $.each(this.thumbChunk,function(i,v) {
            $(tpl.item).appendTo(self.$inner);
        });

        this.$prev.add(this.$holder).add(this.$next).appendTo(this.$wrap);

        this.$wrap.appendTo($('.popup-container'));
    },
    addChunk:function(chunks) {
        var thumbChunk = this.thumbChunk;
        $.each(chunks,function(i,v) {
            thumbChunk.push(v);
        });
    },
    active: function(index) {
        var act = 'popup-thumbnail-active';
        this.$holder.find('.popup-thumbnail-active').removeClass(act);
        this.$holder.find('a').eq(index).addClass(act);

        this.resetPos(index);
    },
    _position: function(options) {
        var opts = this.opts,
            top, showWidth,totalWidth,
            unitWidth = opts.unitWidth,
            unitHeight = opts.unitHeight,
            bottom = opts.bottom,
            left = opts.left,
            padding = opts.padding,
            gap = opts.gap,
            count = opts.count,
            n = this.thumbChunk.length;

        count = count > n ? n : count; 
        showWidth = opts.showWidth = count * (unitWidth+2*padding) + (count-1)*gap;

        this.$wrap.css({
            'position': 'fixed',
            'bottom': bottom,
            'left': left,
        });
        this.$holder.css({
            'width': showWidth, 
            'height': unitHeight + 2* padding
        });
        this.$inner.css({
            'width': n * (unitWidth+2*padding) + (n -1)*gap
        });
    }, 
    resetPos: function(index) {
        var $inner = this.$inner,
            opts = this.opts,
            showWidth = this.opts.showWidth,
            len = (index +1)*(opts.unitWidth+2*opts.padding) + index*opts.gap,
            left = parseInt($inner.css('left')); 

        if (left+len-showWidth > 0) {
            left = showWidth - len;
        } else if (left + len < 0) {
            left = this.opts.unitWidth + 2*this.opts.padding - len;
        }

        $inner.css({
            'left': left,
        });
    },
    move: function(direction) {
        var $inner = this.$inner,
            left =  parseInt($inner.css('left')),
            showWidth = parseInt(this.opts.showWidth),
            totalWidth = parseInt($inner.width());

        if (direction == 'left') {
            $inner.css({
                'left': left-showWidth <= 0 ? 0: (left-showWidth)
            });
        } else {
            $inner.css({
                'left': -(left+showWidth>totalWidth-showWidth ? totalWidth-showWidth:left+showWidth)
            });
        }

    },

    //main 
    onReady: function(instance,options) {
        var $items,
            self = this,
            chunks = [],
            data = instance.dataPool.content,
            opts = $.extend(true,this.opts,this.defaults,options);

        //here add thumbnail
        $.each(data,function(key,value) {
            if (value.thumb) {
                chunks.push(value.thumb);
            } else {
                if (value.type === "image") {
                    chunks.push(value.url);
                } else if (opts.map[value.type]) {
                    chunks.push(opts.map[value.type]);
                } else {
                    chunks.push(opts.map['none']);
                }
            }
        });



        this.addChunk(chunks);


        this.build();  


        $items = this.$holder.find('a');  

        this._position();

        //add to DOM

        this.active(instance.index);     

        this.$prev.on('click',function() { $.proxy(self.move,self)('left'); });
        this.$next.on('click',function() { $.proxy(self.move,self)('right'); });
        this.$holder.delegate('a','click',function(event) {
            var index = $items.index(event.currentTarget);
            instance.show(index);
        });

        instance.$container.on('change.popup',function() {
            self.active(instance.index);
        });
        instance.$container.on('dataChange.popup',function(arr) {
            //maybe it need some work
            
            $.proxy(self.addChunk,self)(arr);
        });
        instance.$container.on('close.popup',$.proxy(self.close,self));
    },
    _load: function(instance) {
        var $items = this.$holder.find('a');
       
        $.each(this.thumbChunk,function(i,v) {
            $('<img />').load(function() {
                $items.eq(i).removeClass('thumb-loading').append($(this));
            }).error(function() {
                $items.ea(i).removeClass('thumb-loading').append($(this));
            }).attr('src', v);
        });  

        this.loaded = true;
    },
    load: function(instance) {
        if (this.loaded != true) {
            this._load(instance);
        }
    },
    close: function(){
        this.$prev.off('click');
        this.$next.off('click');
        this.$holder.off('click');

        this.loaded = false;
        this.thumbChunk = [];
    }
});

$.Popup.registerComponent('infoBar',{
    defaults: {
        tpl: {
            wrap: '<div class="popup-infobar"></div>',
            title: '<span class="popup-title"></span>',
            count: '<span class="popup-count"></span>'
        }
    },
    opts: {},
    onReady: function(instance,options) {
        var opts = $.extend(true,this.opts,this.defaults,options),
            tpl = opts.tpl;

        this.$title = $(tpl.title);
        this.$count = $(tpl.count);
        this.$wrap = $(tpl.wrap).append(this.$title).append(this.$count).appendTo(instance.$container);
    },
    load: function(instance) {
        this.$title.text(instance.title);
        this.$count.text( instance.index + "/" +instance.total);
    },
    close: function(){}
});


/*//extend some little function

$.Popup.prototype.shake: function(x, d, t, o, e, l) {
    var x = Popup.current.shake.distance,
        d = Popup.current.shake.duration,
        t = Popup.current.shake.transition,
        o = Popup.current.shake.loops,
        e = Popup.$container,
        l = Popup.$container.position().left;

    for (var i = 0; i < o; i++) {
        e.animate({
            left: l + x
        }, d, t);
        e.animate({
            left: l - x
        }, d, t);
    };

    e.animate({
        left: l + x
    }, d, t);
    e.animate({
        left: l
    }, d, t);
};



// register type: video  map

$.Popup.registerType('video',{
    videoregs: {
        swf: {
            reg: /[^\.]\.(swf)\s*$/i
        },
        youku: {
            reg: /v\.youku\.com\/v_show/i,
            split: 'id_',
            index: 1,
            url: "http://player.youku.com/player.php/sid/%id%/v.swf"
        },
        vhtml5: {
            reg: /\.(mp4|webm|ogv)$/i,
            vhtml5: 1,
        },
        vimeo: {
            reg: /vimeo\.com/i,
            split: '/',
            index: 3,
            iframe: 1,
            url: "http://player.vimeo.com/video/%id%?hd=1&amp;autoplay=1&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1"
        },
        youtube: {
            reg: /youtube\.com\/watch/i,
            split: '=',
            index: 1,
            iframe: 1,
            url: "http://www.youtube.com/embed/%id%?autoplay=1&amp;fs=1&amp;rel=0"
        },
        metacafe: {
            reg: /metacafe\.com\/watch/i,
            split: '/',
            index: 4,
            url: "http://www.metacafe.com/fplayer/%id%/.swf?playerVars=autoPlay=yes"
        },
        dailymotion: {
            reg: /dailymotion\.com\/video/i,
            split: '/',
            index: 4,
            url: "http://www.dailymotion.com/swf/video/%id%?additionalInfos=0&amp;autoStart=1"
        },
        google: {
            reg: /google\.com\/videoplay/i,
            split: '=',
            index: 1,
            url: "http://video.google.com/googleplayer.swf?autoplay=1&amp;hl=en&amp;docId=%id%"
        },
        megavideo: {
            reg: /megavideo.com/i,
            split: '=',
            index: 1,
            url: "http://www.megavideo.com/v/%id%"
        },
        gametrailers: {
            reg: /gametrailers.com/i,
            split: '/',
            index: 5,
            url: "http://www.gametrailers.com/remote_wrap.php?mid=%id%"
        },
        collegehumornew: {
            reg: /collegehumor.com\/video\//i,
            split: 'video/',
            index: 1,
            url: "http://www.collegehumor.com/moogaloop/moogaloop.jukebox.swf?autostart=true&amp;fullscreen=1&amp;use_node_id=true&amp;clip_id=%id%"
        },
        collegehumor: {
            reg: /collegehumor.com\/video:/i,
            split: 'video:',
            index: 1,
            url: "http://www.collegehumor.com/moogaloop/moogaloop.swf?autoplay=true&amp;fullscreen=1&amp;clip_id=%id%"
        },
        ustream: {
            reg: /ustream.tv/i,
            split: '/',
            index: 4,
            url: "http://www.ustream.tv/flash/video/%id%?loc=%2F&amp;autoplay=true&amp;vid=%id%&amp;disabledComment=true&amp;beginPercent=0.5331&amp;endPercent=0.6292&amp;locale=en_US"
        },
        twitvid: {
            reg: /twitvid.com/i,
            split: '/',
            index: 3,
            url: "http://www.twitvid.com/player/%id%"
        },
        wordpress: {
            reg: /v.wordpress.com/i,
            split: '/',
            index: 3,
            url: "http://s0.videopress.com/player.swf?guid=%id%&amp;v=1.01"
        },
        vzaar: {
            reg: /vzaar.com\/videos/i,
            split: '/',
            index: 4,
            url: "http://view.vzaar.com/%id%.flashplayer?autoplay=true&amp;border=none"
        }
    },
    match: function(instance) {
        var videoid,
            href = instance.url,
            type = instance.type;

        if (type !== 'video') {
            return false
        }

        $.each(this.videoregs, $.proxy(function(i, e) {
            if (href.split('?')[0].match(e.reg)) {

                if (e.split) {
                    videoid = href.split(e.split)[e.index].split('?')[0].split('&')[0];
                    instance.url = e.url.replace("%id%", videoid);
                }
                instance.type = e.iframe ? 'iframe' : e.vhtml5 ? 'vhtml5' : 'swf';

                return false;
            }
        }, this));

        return true;
    },
});

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

//register skin

$Popup.registerSkin('skinSimple',{
    holderWidth: 20,
    holderHeight: 120,

    minTop: 20,
    minLeft: 0,

    autoSize: true,
    sliderEffect: 'none',

    components: {
        controls: {
            ui: 'inside',
        },
        thumbnails: {
            padding: 2,
            bottom: 10,
        }
    },

    _mobile: function(holderWidth, holderHeight, minTop, minLeft) {
        holderWidth = 20;
        holderHeight = 20;
        Popup.current.autoSize = true;
        Popup.$content.find('img').css({
            width: '100%',
            height: '100%'
        });
        return {
            w: holderWidth,
            h: holderHeight,
            t: minTop,
            l: minLeft
        }
    }
});


//register component: counter title thumbnail

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


//register plugin Flickr

$.Popup.Flickr = function() {};
$.Popup.Flickr.prototype = {
    constructor: $.Popup.Flickr,
    find: function(id) {},
};

//register transition 

transitions.zoom = {
    defaults: {
        openSpeed: 500,
        closeSpeed: 500,
    },
    opts: {},

    openEffect: function(rez) {
        var el = Popup.current.element,
            pos,
            origin, startPos, endPos;

        this.opts = $.extend({}, this.defaults, Popup.current.transitionSetting),
        origin = $(el).offset();
        pos = {
            x: $(document).scrollLeft(),
            y: $(document).scrollTop(),
        }
        startPos = {
            x: origin.left - pos.x,
            y: origin.top - pos.y,
        };

        Popup.$overlay.fadeIn();

        Popup.$container.css({
            top: startPos.y,
            left: startPos.x,
            display: 'block',
        }).animate({
            top: rez.top,
            left: rez.left,
        }, 400);
        Popup.$content.css({
            width: 0,
            height: 0,
        }).animate({
            'width': rez.containerWidth,
            'height': rez.containerHeight,
        }, 400);
    },
    closeEffect: function() {
        var opts = $.extend({}, this.defaults, Popup.current.transitionSetting);
        if (!Popup._isOpen) {
            return
        }
        if (Popup.$overlay) {
            Popup.$overlay.fadeOut(opts.closeSpeed, Popup.close);
        } else {
            Popup.$container.fadeOut(opts.closeSpeed, Popup.close);
        }
    },
};

transitions.dropdown = {
    defaults: {
        openSpeed: 150,
        closeSpeed: 800,
        span: 20,
    },
    opts: {},

    openEffect: function(rez) {
        var top = rez.top,
            left = rez.left,
            width = rez.containerWidth,
            height = rez.containerHeight,
            span = 40;
        Popup.$overlay.fadeIn();
        Popup.$content.css({
            'width': width,
            'height': height,
        });
        Popup.$container.css({
            'display': 'block',
            'top': -height,
            'left': left,
        }).animate({
            'top': top + span,
        }, {
            duration: 800,
            easing: 'swing',
        }).animate({
            'top': top,
        }, {
            duration: 500,
            easing: 'swing',
        });
    },
    closeEffect: function() {
        var opts = $.extend({}, this.defaults, Popup.current.transitionSetting),
            height = Popup.$container.height();
        if (!Popup._isOpen) {
            return
        }
        Popup.$container.animate({
            'top': -height,
        }, {
            duration: 800,
            easing: 'swing',
        });

        if (Popup.$overlay) {
            Popup.$overlay.fadeOut(opts.closeSpeed, Popup.close);
        } else {
            Popup.$container.fadeOut(opts.closeSpeed, Popup.close);
        }
    },
};

//register sliderEffects

*/

