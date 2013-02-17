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
        $doc = $(document),
        toString = Object.prototype.toString;
    var Util = (function() {
        return {
            checkType: function() {},

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
            calculate: function(obj) {

            },

            //check if the needed files have been loaded
            checkFile: function() {},

            trigger: function(type) {

            },
            loadfail: function(type) { // error process, image ajax iframe vhtml5

            }

        };
    }());
    var event = "beforLoad,afterLoad,close,change";
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
    var defaults = {
        width: 760,
        height: 428,
        minWidth: 400,
        minHeight: 200,

        minTop: 40,
        minLeft: 10,
        holderWidth: 0,
        holderHeight: 80,

        autoSize: true,
        closeBtn: true,
        winBtn: true, //click overlay to close popup

        preload: false,

        transition: 'fade',
        transitionSetting: {},
        sliderEffect: 'fade',
        sliderSetting: {},

        tpl: {
            overlay: '<div class="popup-overlay"></div>',
            container: '<div class="popup-container"><div class="popup-content" ><div class="popup-content-inner"></div></div><div class="popup-info"></div><div class="popup-controls"></div></div>',
            image: '<img class="popup-image" src="{href}" alt="" />',
            iframe: '<iframe id="popup-frame{rnd}" name="popup-frame{rnd}" class="popup-iframe" frameborder="0" vspace="0" hspace="0"' + ($.browser.msie ? ' allowtransparency="true"' : '') + '></iframe>',
            error: '<p class="popup-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
            closeBtn: '<a title="Close" class="popup-controls-close" href="javascript:;"></a>',
            next: '<a title="Next" class="popup-controls-next" href="javascript:;"><span></span></a>',
            prev: '<a title="Previous" class="popup-controls-prev" href="javascript:;"><span></span></a>'
        }
    };

    _nativeFullscreen.listen();

    // Plugin constructor
    var Popup = $.Popup = function(data, options) {
        var dataPool;

        var self = this;

        //process on arguments
        var agms = arguments.length;

        // the flag of instance
        this.initialized = false;
        this.isGroup = null;
        this.isOpened = false;
        //dataPool is a database
        this.dataPool = {
            content: [], //thie could be set by plugin contains type url info 
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

        this.current = null;
        this.coming = null;

        function init() {
            dataPool.skin = options.skin || 'default';
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
            
            self.current = $.extend(true, defaults, skin, options);
           
            //component
            if (skin.components) {
                $.each(skin.components, function(key, value) {
                    var component = {};

                    if (value !== false) {
                        component.name = key;
                        if (toString.apply(value) === '[object Object]' { // component.options could be 'undefined' if not config
                            component.options = value;
                        }
                        dataPool.components.push(component);
                        }

                    });
                }


                this.initialized = true;
            }
        }

        init();
    };
    Popup.prototype = {
        constructor: Popup,
        _beforeshow: function() {
            var self = this,
                current = this.current,
                dataPool = this.dataPool,
                comps = dataPool.components,
                tpl = self.current.tpl;

            //show overlay and container from tpl...
            $(tpl.wrap).appendTo($('body')).addClass(dataPool.skin).css({display: 'none'});

            // transtions
            transtions[current.transition]('openEffect');

            //show componnets
            $.each(comps, function(i, v) {
                components[v.name].onReady(self,v.options);
            });

            Util.trigger('beforeshow.popup');
        },
        show: function(index) {
            var data,
                dataPool = this.dataPool,
                comps = dataPool.components;

            index = index || 0;
            data = dataPool.content[index];

            this.index = index;
            this.type = data.type;
            this.url = data.url;

            if (this.isOpened === false) {
                this._beforeshow();
            } else {

                Util.trigger('change.popup');
            }

            this._load();
        },
        _load: function() {
            var comps = this.dataPool.components;

            types[this.type].load(this);

            //load componnets content
            $.each(comps, function(i, v) {
                components[v.name].load && components[v.name].load();
            });
        },
        _afterLoad: function() {
            var rez;

            this._hideLoading();

            rez = Util.calculate(this.current);
            Util.trigger('resize',rez);

            if (this.isOpened) {
                // sliderEffect
                sliderEffects[this.current.sliderEffect].init(this);
            } else {
                //for first open
                this.$inner.empty();
                this.$inner.append(this.current.content);
            }

            Util.trigger('afterLoad.popup');

            if (this.current.preload === true) {

                //todo: this excute prload function
            }

            this.isOpened = true;
        },
        next: function() {
            var index = this.index;
            index++;
            if (index >= this.total - 1) {
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
            this.isOpened = false;

            transtions[current.transition].closeEffect();

            Util.trigger('close');

            $(this).off('.popup');
            
        },
        destory: function() {
            this.initialized = false;
        },

        _hideLoading: function() {},

        _showLoading: function() {},

        addComponent: function(name, options) { //add component which is registered to current instance 
            var component = {};
            $.each(this.dataPool.components, function(i, v) {
                if (v.name === name) {
                    alert('this component has been added !')
                    return
                }
            });
            component.name = name;
            component.options = options;
            this.dataPool.components.push(component);

        }
        delComponent: function(name) {
            $.each(his.dataPool.components, function(i, v) {
                if (v.name === name) {
                    his.dataPool.components.splice(i, 1);
                }
            });
        }
    }

    $.extend(Popup, {

        defaults: {
            width: 760,
            height: 428,
            minWidth: 400,
            minHeight: 200,

            minTop: 40,
            minLeft: 10,
            holderWidth: 0,
            holderHeight: 80,

            action: false, // taggle to autoplay by click      
            autoPlay: false,
            playSpeed: 1500,
            isPaused: false,

            autoSize: true,
            imgBg: '#222',
            closeBtn: true,
            winBtn: true, //click overlay to close popup

            transition: 'fade',
            transitionSetting: {},
            sliderEffect: 'fade',
            sliderSetting: {},

            components: {
                thumbnails: {},
                controls: {},
                title: {},
            },

            shake: {
                distance: 15,
                duration: 50,
                transition: 'linear',
                loops: 4,
            },

            selector: null, //need to fix
            ajax: {
                dataType: 'html',
                headers: {
                    'popup': true
                }
            },
            swf: {
                allowscriptaccess: 'always',
                allowfullscreen: 'true',
                wmode: 'transparent',
            },
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

            keys: true,
            initialTypeOptions: false,
            preload: false,
        },

        isMobile: false,
        defaultSkin: 'skinRimless',

        current: {},
        previous: {},
        components: {},
        
        

        //
        //privite method
        //

        _init: function(element, options) {

            var self = element,
                $self = $(element),
                defaults,
                url, index, group, count, metas = {};


            //filter the same popup-group name with the current click element as a group
            group = Popup.elements.filter(function() {
                var data = $(this).data('popup-group');
                if (metas.group) {
                    return data == metas.group;
                }
            });

            count = group.length;
            if (count >= 2) {
                $.each(group, function(i, v) {
                    if ($(v).data('popup-group-options')) {
                        metas.groupoptions = $(v).data('popup-group-options');
                    }
                });
            }

            if (metas.options) {
                metas.options = Popup._string2obj(metas.options);
            }

            if (metas.groupoptions) {
                metas.options = $.extend(true, Popup._string2obj(metas.groupoptions), metas.options);
            }

            if (!options) {
                options = {};
            }

            options = $.extend(true, options, metas.options, metas);
            options.skin = options.skin || Popup.defaultSkin;

            Popup.settings = {};
            $.extend(true, Popup.settings, Popup.defaults, Popup.skins[options.skin], options); //要修改

            //build Popup.group object
            index = count >= 2 ? group.index(self) : 0;
            url = $self.attr('href');

            Popup.settings = $.extend({}, Popup.settings, {
                index: index,
                url: url,
                element: element,
            });

            //adding index and get config for every member of group 
            if (count >= 2) {
                Popup.group = [];
                Popup.groupoptions = metas.groupoptions ? Popup._string2obj(metas.groupoptions) : null;
                group.each(function(i, v) {
                    var $url, $type, obj = {};

                    $url = $(v).attr('href');
                    $type = $(v).data('popup-type');

                    $.extend(obj, {
                        index: i,
                        url: $url,
                        type: $type,
                        element: v,
                    });
                    Popup.group.push(obj);
                });
            }
            console.log(Popup.settings.type);
        },
        _afterLoad: function() {
            var rez,
            type = Popup.current.type;

            //calculate necessary dimension before trigger open transition
            rez = Popup._calculate();
            Popup._trigger('resize', rez);

            if (!Popup._isOpen) {

                Popup.transitions[Popup.current.transition]['openEffect'](rez);

                //remove old content before loading new content
                Popup.$content.empty();
                Popup.$content.append(Popup.current.content);
            } else {

                //slider
                Popup.sliderEffects[Popup.current.sliderEffect]['init'](rez);
            }

            Popup._isOpen = true;

            //give a chance to reset some infos
            Popup._trigger('afterLoad');

            //add autoPlay 
            if (Popup.current.autoPlay === true) {
                Popup._slider.play();
            }

            //preload
            if (type == "image" && Popup.group && Popup.group[1]) {
                Popup.types.image.imgPreLoad();
            }

            
        },
        _slider: {
            timer: {},
            clear: function() {
                clearTimeout(this.timer);
            },
            set: function() {
                this.clear();
                if (Popup.group && Popup.group[1]) {
                    this.timer = setTimeout(Popup.next, Popup.current.playSpeed);
                }
            },
            play: function() {
                Popup.current.isPaused = false;
                this.set();
            },
            pause: function() {
                this.clear();
                Popup.current.isPaused = true;
            }
        },
        _calculate: function() {
            var top, left, width, height,
            maxWidth, maxHeight,
            result = {},
            rez = {},
            obj = {},

            current = Popup.current,
            aspect = current.aspect,

            //save original image dimension,
            originWidth = current.width,
            originHeight = current.height,

            winWidth = $(window).width(),
            winHeight = $(window).height(),

            //here create new vars to save some current properties
            //so we will not change the current value and can reuse it in calcultion
            minWidth = current.minWidth,
            minHeight = current.minHeight,
            minTop = current.minTop,
            minLeft = current.minLeft,
            holderWidth = current.holderWidth,
            holderHeight = current.holderHeight,

            scale = function(x, y, rate) {
                var w, h;
                w = y * rate;
                h = x / rate;

                if (w > x) {
                    w = x;
                }
                if (h > y) {
                    h = y;
                }

                return {
                    w: w,
                    h: h,
                }
            };

            //here design for mobile
            if (Popup._resposive(winWidth)) {
                obj = Popup.current._mobile(holderWidth, holderHeight);
                holderWidth = obj.w;
                holderHeight = obj.h;
                //mintop,minleft need to be processed
            }

            maxWidth = winWidth - holderWidth;
            maxHeight = winHeight - holderHeight;

            if (current.autoSize) {
                width = (maxWidth - 2 * minLeft) > originWidth ? originWidth : (maxWidth - 2 * minLeft) < minWidth ? minWidth : (maxWidth - 2 * minLeft);
                height = (maxHeight - 2 * minTop) > originHeight ? originHeight : (maxHeight - 2 * minTop) < minHeight ? minHeight : (maxHeight - 2 * minTop);

                if (aspect) {
                    result = scale(width, height, aspect);
                    width = result.w;
                    height = result.h;
                }
            } else {
                width = Popup.settings.width;
                height = Popup.settings.height;
            }

            //centered the container
            top = (maxHeight - height) / 2 < minTop ? minTop : (maxHeight - height) / 2;
            left = (maxWidth - width) / 2 < minLeft ? minLeft : (maxWidth - width) / 2;

            //give a chance for components component resize
            //note: it defaults padding and margin both equal to 0 
            rez = {
                winWidth: winWidth,
                winHeight: winHeight,
                containerWidth: width,
                containerHeight: height,
                holderWidth: holderWidth,
                holderHeight: holderHeight,
                top: top,
                left: left,
            };

            return rez;

            //here pass dimension info as a argument to components
            Popup._trigger('resize', rez);
        },
        _resize: function() {
            var rez = Popup._calculate(),
                top = rez.top,
                left = rez.left,
                width = rez.containerWidth,
                height = rez.containerHeight,
                img = Popup.$content.find('img');

            //reposition set on container
            Popup.$container.css({
                top: top,
                left: left,
            });
            //resize set on content
            Popup.$content.css({
                width: width,
                height: height,
            });

            //here pass dimension info as a argument to components
            Popup._trigger('resize', rez);
        },
        _makeEls: function(tag, className, style) {
            var element = document.createElement(tag),
                $element = $(element);
            if (arguments[1]) {
                $element.addClass(className);
            }
            if (arguments[2]) {
                $element.css(style);
            }
            return $element;
        },
        _string2obj: function(string) {
            return eval("(" + '{' + string + '}' + ")");
        },
        _trigger: function(event) {
            var component, components = Popup.components;
            for (var component in components) {

                //here to check wether to close some component
                if (Popup.current.components[component] !== null) {
                    components[component][event] && components[component][event](arguments[1]);
                }
            }
        },
        _loadfail: function(string) {
            var $inner = $('<div><p>Sorry! cant find ' + string + ',</P></div>');
            console.log('load failed');
            $inner.css({
                width: '100%',
                height: '100%',
                textAlign: 'center',
                color: '#fff'
            });
            $.extend(Popup.current, {
                width: 600,
                height: 400,
                content: $inner,
            });

            //Popup._hideLoading();
            Popup._afterLoad();
        },
        _showLoading: function() {
            var $loading;
            Popup._hideLoading();

            // If user will press the escape-button, the request will be canceled
            $(document).on('keydown.loading', function() {
                if ((e.which || e.keyCode) === 27) {
                    Popup.cancel();
                    return false;
                }
            });

            $loading = Popup._makeEls('div', 'popup-loading');
            $loading.appendTo(Popup.$container);
        },
        _hideLoading: function() {
            $(document).unbind('keydown.loading');
            $('.popup-loading').remove();
        },
        _resposive: function(width) {
            var lower = 320,
                upper = 479,
                width = parseInt(width);

            if (lower < width && upper > width) {
                return true;
            } else {
                return false;
            }
        },

        //
        //adding public Method
        //
        show: function(contents, options) {
            var $container, $content, $controls, $close, $custom, $info,
            options, current, index, url, obj, type,
            previous = Popup.current,
                toString = Object.prototype.toString;

            function bindEvents() {
                //binding resize event on window
                $(window).on('resize', function() {
                    Popup._resize();
                    return false;
                });

                // Key Bindings
                if (Popup.current.keys && !Popup._isOpen && Popup.group) {
                    $(document).bind('keydown.popup', function(e) {
                        var key = e.keyCode;

                        console.log(key);
                        console.log(e.which);

                        if (key === 27) {
                            Popup.close();
                            return false;
                        }
                        if (Popup.slider == true && key === 37) {
                            Popup.prev();
                            return false;
                        } else if (Popup.slider == true && key === 39) {
                            Popup.next();
                            return false;
                        }
                    });
                }

                // //autoPlay
                // if (Popup.current.autoPlay === true) {
                //     $container.bind('hover',function(){
                //         Popup._slider.pause();
                //     });
                // }                    
            };

            Popup.previous = previous;

            //process options 
            if (toString.apply(options) === '[object Object]') {
                options = options || {};
            } else if (!isNaN(options)) {

                // only when options === number  
                index = options;

                console.log(Popup.groupoptions);
                options = {};
            }

            if (!Popup.settings || Popup._isOpen) {

                options.skin = options.skin || Popup.defaultSkin;
                Popup.settings = {};
                $.extend(true, Popup.settings, Popup.defaults, Popup.skins[options.skin], Popup.groupoptions);
            }

            //process contents
            if (toString.apply(contents) === '[object Array]' && !Popup._isOpen) {
                // for show([],{}||index);
                var count = contents.length,
                    i = 0;
                Popup.group = [];
                for (i; i < count; i++) {
                    obj = {
                        url: null,
                        title: '',
                    };
                    if (toString.apply(contents[i]) === '[object String]') {
                        obj.url = contents[i];
                    } else if (toString.apply(contents[i]) === '[object Object]') {
                        $.extend(obj, contents[i]);
                    }
                    Popup.group.push($.extend({}, options, obj));
                }

                if (isNaN(arguments[1])) {
                    index = 0;
                }
                index = index % Popup.group.length;

                if (!Popup.current) {
                    Popup.current = {};
                }

                $.extend(true, Popup.current, Popup.settings, Popup.group[index]);

                Popup.current.index = index;
            } else if (!Popup._isOpen) {
                if (arguments.length === 1) {
                    //for public api show();
                    Popup.current = $.extend(true, Popup.current, Popup.settings, arguments[0].options);
                    Popup.current.url = arguments[0].url;
                } else {
                    //for private function show() and show({},index);
                    Popup.current = $.extend(true, Popup.current, Popup.settings, options);
                }
            }

            Popup.current.aspect = null;
            current = Popup.current;

            if (index < 0 || (Popup.group && index > Popup.group.length - 1)) {
                index = 0;
            }

            //here we can see how it works
            //click image: making Popup.current,Popup.group
            //click next: extent Popup.current with Popup.group[index]
            //note: Popup.current only made when firstly click
            if (Popup.group && Popup.group[1]) {
                if (arguments.length === 2 && toString.apply(arguments[1]) === '[object Number]') {
                    Popup.current = $.extend({}, Popup.current, Popup.groupoptions, Popup.group[index]);
                    Popup.current.index = index;
                }
                Popup.slider = true;
            }

            // trigger types verifaction.
            $.each(Popup.types, function(key, value) {
                if (Popup.types[key].match && Popup.types[key].match(current.url.split(',')[0])) {
                    type = key;
                    return false;
                }
            });

            console.log(current.type, type);

            type = current.type || type;
            Popup.current.type = type;

            console.log(type);

            //initialize custom type register
            Popup.types[type].initialize && Popup.types[type].initialize();

            console.log(Popup.types);

            // $('body').css({
            //     overflow: 'hidden',
            // });

            //build popup frame
            if (!Popup._isOpen) {

                //create container 
                $container = Popup._makeEls('div', 'popup-container');
                $container.css({
                    'position': 'absolute',
                    'display': 'block',
                });
                $content = Popup._makeEls('div', 'popup-content').css({
                    overflow: 'hidden',
                    textAlign: 'center',
                    position: 'relative',
                });
                $info = Popup._makeEls('div', 'popup-info');
                $controls = Popup._makeEls('div', 'popup-controls');
                $custom = Popup._makeEls('div', 'popup-custom');
                $container.append($content, $info, $controls, $custom);

                $.extend(Popup, {
                    $container: $container,
                    $content: $content,
                    $info: $info,
                    $controls: $controls,
                    $custom: $custom,
                });

                if (!Popup.group || !Popup.group[1]) {
                    Popup.current.holderHeight = 20;
                }

                //trigger the component registered on components object
                Popup._trigger('onReady');

                //add close buttom if controls component is cancelled
                if (!Popup.$close && Popup.current.closeBtn) {
                    $close = Popup._makeEls('div', 'popup-controls-close');
                    $close.css({
                        'position': 'absolute'
                    }).appendTo($controls);
                    $close.on('click', function() {
                        Popup.close();
                        return false;
                    });
                }

                //set skin
                if (Popup.$overlay) {
                    Popup.$overlay.addClass(Popup.current.skin);
                } else {
                    Popup.$container.addClass(Popup.current.skin);
                }

                //to make transition more smooth
                if (Popup.current.type == 'image') {
                    Popup.$content.css({
                        backgroundColor: Popup.current.imgBg
                    });
                }

                //add container to overlay or body
                $container.appendTo(Popup.$overlay || 'body');

                //binding event
                bindEvents();
            }

            Popup.types[type].load();

            console.log(type);
        },
        close: function() {

            //if already closed ,return
            if (!Popup._isOpen) {
                return
            }

            //trigger close transition
            if (Popup.closeAnimate == null) {
                Popup.closeAnimate = true;
                return Popup.transitions[Popup.current.transition]['closeEffect']();
            }

            Popup.cancel();

            //recover body setting
            $('body').css({
                overflow: 'scroll',
            });

            //unbind event
            $(window).unbind('resize');
            $(document).unbind('keydown.popup');
            // Popup.$container.unbind('hover');

            //delete skin
            if (Popup.$overlay) {
                Popup.$overlay.removeClass(Popup.current.skin);
            } else {
                Popup.$container.removeClass(Popup.current.skin);
            }

            //stop autoplay first before close
            if (Popup.current.isPaused === false) {
                Popup._slider.pause();
            }

            //trigger to remove the component registered on components object
            Popup._trigger('close');

            Popup.$container.remove();
            Popup.$close = null;

            Popup.closeAnimate = null;
            Popup.current.isPaused = null;

            Popup._isOpen = false;
            Popup.current = null;
            Popup.settings = null;
            Popup.group = null;

            return false;
        },
        next: function() {
            var index = Popup.current.index,
                count = Popup.group.length;
            console.log(index);
            index += 1;
            if (index >= count) {
                index = 0;
            }

            index = index % count;
            Popup.current.index = index;
            console.log(Popup.current.index);

            Popup.show({}, index);
        },
        prev: function() {
            var index = Popup.current.index,
                count = Popup.group.length;
            index -= 1;
            if (index < 0) {
                index = count - 1;
            }
            index = index % count;
            Popup.current.index = index;
            Popup.show({}, index);
        },
        //cancel iamge loading or abort ajax request
        cancel: function() {
            Popup._hideLoading();
            if (Popup.photo) {
                Popup.photo.onload = Popup.photo.onerror = null;
            }
            if (Popup.ajax) {
                Popup.ajax.abort();
            }
            Popup.ajax = null;
        },
        update: function() {
            Popup.show({}, Popup.current.index);
        },
        destory: function() {
            Popup.close();
            Popup.$overlay.remove();

            Popup = null;
        },
        getCurrent: function() {
            return Popup.current.index + 1;
        },
        hasNext: function() {
            if (Popup.group && Popup.current.index < Popup.group.length - 1) {
                return true;
            } else {
                return false;
            }
        },
        play: function() {
            Popup.current.autoPlay === true;
            Popup.next();
        },
        pause: function() {
            Popup._slider.pause();
        },
        isPaused: function() {
            return Popup.current.isPaused;
        },
        isOpen: function() {
            if (Popup._isOpen) {
                return true;
            } else {
                return false;
            }
        },
        jumpto: function(index) {
            if (index < 0 && index > Popup.group.length - 1) {
                index = 0;
            }
            Popup.show({}, index);
        },



        //open api

    });

    //static method for the page

    $.extend(Popup, {
        //for plugin to get outside data
        run: function(selector,options) {
            $(selector).Popup(options);
        },
        
        // registered type cant be auto matched , it need manually add 
        registerType: function(name, options) {
            //forbid to register a exist type
            if (types[name]) { return }

            types[name] = {};
            
            $.each(options,function(key,value) {
                types[name][key] = value;
            });

            //overwrite load method if it has load 
            types[name].load && types[name].load = function(instance) {
                //init before load
                options.init && options.init(instance);

                if (options.extends) {
                    types[options.extends].load(instance);
                } else {
                    options.load(instance);
                }
            };
        },
        registerSkin: function(name) {
            Popup.defaultSkin = name;
        },
        registerComponent: function(name, options) {
            if(components[name]) { return }
            components[name] = options;
        }
    });

    //
    //below object contains basic method and defaults for extending effect.
    //
    var transitions = {}, sliderEffects = {}, components = {};

    var skins = {
        skinRimless: {
            minTop: 20,
            minLeft: 10,
            holderWidth: 0,
            holderHeight: 100,

            autoSize: true,
            sliderEffect: 'none',

            components: {
                controls: {
                    ui: 'outside'
                },
                thumbnails: true
            }
            //ajust layout for mobile device
            _mobile: function(holderWidth, holderHeight, minTop, minLeft) {
                holderWidth = 0;
                holderHeight = 10;
                Popup.current.autoSize = true;
                Popup.$content.find('img').css({
                    width: '100%',
                    height: '100%'
                });
                return {
                    w: holderWidth,
                    h: holderHeight,
                    t: minTop,
                    l: minLeft,
                }
            }

        },
        skinSimple: {
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
                    l: minLeft,
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

                    instance.current.image.width = width;
                    instance.current.image.height = height;
                    instance.current.image.aspect = width / height;

                    //for centering image
                    if (!Popup.current.autoSize) {
                        if (width > height) {
                            $(img).css({
                                width: '100%',
                                height: 'auto',
                            });
                        } else {
                            $(img).css({
                                height: '100%',
                                width: 'auto',
                            });
                        }
                    } else {
                        $(img).css({
                            width: '100%',
                            height: '100%',
                        });
                    }

                    instance.current.content = img;

                    instance._afterLoad();
                };

                img.onerror = function() {
                    this.onload = this.onerror = null;

                    instance.current.content = Util.loadfail('image');
                    instance._afterLoad();
                };

                if (img.complete === undefined || !img.complete) {
                    Util.showLoading();
                }

                img.src = instance.url;
            },
            imgPreLoad: function(instance) {
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
                return url.charAt(0) == "#";
            },
            load: function(instance) {
                var $inline = $(Popup.current.url).clone().css({
                    'display': 'block'
                });

                Popup.current.content = $('<div>').addClass('popup-content-inner').css({
                    'width': '100%',
                    'height': '100%'
                }).html($inline);
                Popup._afterLoad();
            }
        },
        vhtml5: {
            match: function(url) {
                return url.match(/\.(mp4|webm|ogg)$/i);
            },
            load: function() {
                var $video,
                source, index, type, arr,
                url = Popup.current.url,
                    vhtml5 = Popup.current.vhtml5;


                $video = Popup._makeEls('video', 'popup-content-video').attr({
                    'width': vhtml5.width,
                    'height': vhtml5.height,
                    'preload': vhtml5.preload,
                    'controls': vhtml5.controls,
                    'poster': vhtml5.poster,
                });

                arr = url.split(',');
                $.each($(arr), function(i, v) {
                    var type;
                    type = $.trim(v.split('.')[1]);
                    source += '<source src="' + v + '" type="' + vhtml5.type[type] + '"></source>';
                });

                $.each(vhtml5.source, function(i, arr) {
                    source += '<source src="' + arr.src + '" type="' + vhtml5.type[arr.type] + '"></source>';
                });

                $(source).appendTo($video);

                Popup.current.content = $video;


                Popup._afterLoad();
            }
        },
        swf: {
            match: function(url) {
                return url.match(/\.(swf)((\?|#).*)?$/i);
            },
            load: function() {
                var $object, $swf, content = '',
                    embed = '',
                    swf = Popup.current.swf;

                $object = $('<object class="popup-content-object" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + Popup.current.url + '"></param></object>');

                $.each(swf, function(name, val) {
                    content += '<param name="' + name + '" value="' + val + '"></param>';
                    embed += ' ' + name + '="' + val + '"';
                });

                $(content).appendTo($object);

                $swf = $('<embed src="' + Popup.current.url + '" type="application/x-shockwave-flash"  width="100%" height="100%"' + embed + '></embed>').appendTo($object);

                Popup.current.content = Popup.$swf = $object;

                Popup._afterLoad();
            }
        },
        //you should set type when using iframe && ajax,they cant auto match, 
        iframe: {
            match: function(url) {
                if (url.match(/\.(ppt|PPT|tif|TIF|pdf|PDF)$/i)) {
                    return true;
                }
            },
            load: function() {
                var iframe = '<iframe name="popup-frame" class="popup-content-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + ($.browser.msie ? ' allowtransparency="true"' : '') + '></iframe>';

                //$iframe
                Popup.$iframe = $(iframe).css({
                    'width': '100%',
                    'height': '100%',
                    'border': 'none'
                }).attr('src', Popup.current.url);

                Popup.current.content = Popup.$iframe;
                Popup._afterLoad();

            }
        },
        ajax: {
            load: function() {
                var content, current = Popup.current;
                Popup.ajax = $.ajax($.extend({}, current.ajax, {
                    url: current.url,
                    error: function() {
                        Popup._loadfail('ajax');
                    },
                    success: function(data, textStatus) {
                        if (textStatus === 'success') {
                            Popup._hideLoading();

                            // proceed data
                            if (current.selector) {
                                content = $('<div>').html(data).find(current.selector);
                            } else {
                                content = data;
                            }

                            current.content = $('<div>').addClass('popup-content-inner').css({
                                'width': '100%',
                                'height': '100%',
                                'overflow': 'scroll'
                            }).html(content);
                            Popup._afterLoad();
                        }
                    }
                }));
            }
        },

        //video && map are composite type,you should set type when using them
        //they dont have their own loading method,they process url,and then load with basic types' load method 
        
    };

    //
    // here you can add your custom transition & slider effect , types , components 
    //

    //transitions
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
    transitions.fade = {
        defaults: {
            openSpeed: 500,
            closeSpeed: 500,
        },
        openEffect: function(rez) {
            var opts = $.extend({}, this.defaults, Popup.current.transitionSetting);
            if (Popup._isOpen) {
                return
            }

            Popup.$container.css({
                top: rez.top,
                left: rez.left,
            });
            //resize set on content
            Popup.$content.css({
                width: rez.containerWidth,
                height: rez.containerHeight,
            });

            if (Popup.$overlay) {
                Popup.$container.css({
                    'display': 'block'
                });
                Popup.$overlay.fadeIn(opts.openSpeed);
            } else {
                Popup.$container.fadeIn(opts.openSpeed);
            }
        },
        // closeEffect need callback function to close popup
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

    //slider
    sliderEffects.none = {
        init: function(rez) {
            //reposition set on container
            Popup.$container.css({
                top: rez.top,
                left: rez.left,
            });

            //resize set on content
            Popup.$content.css({
                width: rez.containerWidth,
                height: rez.containerHeight,
            });
            Popup.$content.empty();
            Popup.$content.append(Popup.current.content);
        },
    };
    sliderEffects.zoom = {
        defaults: {
            speed: 500,
            easing: 'swing',
        },
        init: function(rez) {
            var opts = $.extend({}, this.defaults, Popup.current.sliderSetting);

            Popup.$content.empty();
            Popup.$content.append(Popup.current.content);

            Popup.$container.stop().animate({
                top: rez.top,
                left: rez.left,
            }, {
                duration: 500,
                easing: 'swing',
            });
            Popup.$content.stop().animate({
                width: rez.containerWidth,
                height: rez.containerHeight,
            }, {
                duration: 500,
                easing: 'swing',
                complete: function() {

                }
            });


        }
    };
    sliderEffects.fade = {
        defaults: {
            speed: 500,
            easing: 'swing',
        },
        init: function(rez) {
            var opts = $.extend({}, this.defaults, Popup.current.sliderSetting);
            Popup.$container.css({
                top: rez.top,
                left: rez.left,
            });

            //resize set on content
            Popup.$content.css({
                width: rez.containerWidth,
                height: rez.containerHeight,
            });
            Popup.previous.content.css({
                zIndex: 2,
            });

            Popup.$content.append(Popup.current.content);

            Popup.previous.content.animate({
                'opacity': 0,
            }, {
                duration: 500,
                easing: 'swing',
                complete: function() {
                    console.log($(this));

                    $(this).remove();
                }
            });
            //Popup.$content.append(Popup.current.content);
        },
    };

    //components 
    components.overlay = {
        defaults: {},
        opts: {},
        onReady: function() {
            if (!this.$overlay) {
                this.create();
            }
            this.open();
        },
        create: function() {
            var $overlay = Popup._makeEls('div', 'popup-overlay').appendTo('body');
            $overlay.on('click', function(event) {
                if ($(event.target).is('.popup-overlay') && Popup.current.winBtn) {
                    Popup.close();
                    $(this).css({
                        cursor: 'pointer',
                    })
                    return false;
                }
            }).css({
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
            });

            Popup.$overlay = $overlay;
        },
        open: function() {

        },
        close: function() {
            Popup.$overlay.remove();
        }
    };
    components.controls = {
        defaults: {
            slider: true,
            ui: 'outside',
            autoPlay: false,
            action: false,
        },
        opts: {},
        active: false,

        onReady: function() {
            if (Popup.current.skin) {
                this.opts = $.extend({}, this.defaults, Popup.current.components.controls);
            } else {
                this.opts = this.defaults;
            }

            console.log(Popup.current.components.controls)
            console.log(this.opts);

            if (!Popup.group) {
                return
            }

            this.create();
            this.open();
            this.active = true;
        },
        create: function() {
            var self = this,
                $prev = Popup._makeEls('div', 'popup-controls-prev'),
                $next = Popup._makeEls('div', 'popup-controls-next'),
                $close = Popup._makeEls('div', 'popup-controls-close'),
                $play = Popup._makeEls('div', 'popup-controls-play'),
                bindEvents = function() {
                    if (self.opts.action || self.opts.autoPlay) {
                        Popup.$content.on('click', function() {
                            if (Popup.current.isPaused === true) {
                                slider.play();
                            }
                            if (Popup.current.isPaused === false) {
                                slider.pause();
                            }
                        });
                    }
                    if (self.opts.action) {
                        Popup.$content.on('click', function() {
                            play();
                        });
                    }

                    //bind slider button event
                    $prev.on('click', function() {
                        Popup.prev();
                        return false;
                    });
                    $next.on('click', function() {
                        Popup.next();
                        return false;
                    });

                    //bind close button event
                    $close.on('click', function() {
                        Popup.close();
                        return false;
                    });
                }

            Popup.$controls.append($prev, $play, $next, $close);

            $.extend(Popup, {
                $prev: $prev,
                $next: $next,
                $close: $close,
                $play: $play,
            });

            //optional ui
            if (self.opts.ui == 'outside') {
                Popup.$prev.css({
                    'position': 'fixed',
                });
                Popup.$next.css({
                    'position': 'fixed',
                });
            } else if (self.opts.ui == 'inside') {
                Popup.$prev.css({
                    'position': 'absolute',
                });
                Popup.$next.css({
                    'position': 'absolute',
                });
            }

            bindEvents();
        },
        open: function() {
            if (this.opts.autoPlay) {
                Popup.$play.css({
                    'display': 'block'
                });
                Popup._slider.play();
            }
        },
        close: function() {
            Popup.$content && Popup.$content.unbind('click');
            Popup.$prev && Popup.$prev.unbind('click');
            Popup.$next && Popup.$next.unbind('click');
            Popup.$controls && Popup.$controls.remove();
            this.active = false;
        },
        resize: function(rez) {
            var top, left;
            if (!this.active || this.opts.ui !== 'outside') {
                return
            }

            top = (rez.winHeight - rez.holderHeight) / 2;
            left = (rez.winWidth - rez.containerWidth - rez.holderWidth) / 4;

            Popup.$prev.css({
                'position': 'fixed',
                'top': top,
                'left': left,
            });
            Popup.$next.css({
                'position': 'fixed',
                'top': top,
                'right': left,
            });
        }
    };
    //need to change
    components.thumbnails = {
        defaults: {
            count: 5,
            unitWidth: 80,
            unitHeight: 80,
            bottom: 16,
            left: 0,
            padding: 0, //for border
            gap: 20,
        },
        opts: {},
        $thumbnails: null,
        $thumHolder: null,
        $inner: null,

        visualWidth: null,

        onReady: function() {

            if (!Popup.group || Popup.current.type !== 'image') {
                return
            }

            //for mobile
            if (Popup.isMobile) {
                Popup.current.holderWidth = 0;
                Popup.current.holderHeight = 0;
            }

            this.opts = $.extend({}, this.defaults, Popup.current.components.thumbnails);

            this.create();
        },
        create: function() {
            var top, visualWidth, totalWidth,
            unitWidth = this.opts.unitWidth,
                unitHeight = this.opts.unitHeight,
                bottom = this.opts.bottom,
                left = this.opts.left,
                padding = this.opts.padding,
                gap = this.opts.gap,
                count = this.opts.count,
                group = Popup.group,
                index = Popup.current.index,
                $thumbnails = $('<div>').addClass('popup-thumbnails'),
                $leftButtom = $('<div>').addClass('popup-thumbnails-left'),
                $rightButtom = $('<div>').addClass('popup-thumbnails-right'),
                $thumHolder = $('<div>').addClass('popup-thumbnails-holder'),
                $inner = $('<div>').addClass('popup-thumbails-inner').appendTo($thumHolder),
                moveEvent = function(direction) {
                    var left = $inner.css('left');

                    totalWidth = $inner.width();
                    left = parseInt(left);

                    if (direction == 'left') {
                        $inner.css({
                            'left': left - visualWidth < 0 ? 0 : (left - visualWidth),
                        });
                    } else {
                        $inner.css({
                            'left': -(left + visualWidth > totalWidth - visualWidth ? totalWidth - visualWidth : left + visualWidth),
                        });
                    }
                };

            console.log("thumbnails");

            count = count > group.length ? group.length : count;
            visualWidth = count * (unitWidth + 2 * padding) + (count - 1) * gap;

            //set necessary css style
            $inner.css({
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'width': group.length * (unitWidth + 2 * padding) + (group.length - 1) * gap,
            });

            $thumHolder.css({
                'display': 'inline-block',
                'position': 'relative',
                'width': visualWidth,
                'height': unitHeight + 2 * padding,
            });

            $thumbnails.css({
                'position': 'fixed',
                'bottom': bottom,
                'left': left,
                'text-align': 'center',
            }).append($leftButtom, $thumHolder, $rightButtom);

            //load image
            $.each(Popup.group, function(i) {
                var url = Popup.group[i].url,
                    $wrap = $('<a href="#">');

                if (url == undefined) {
                    return
                }

                $wrap.addClass('loading').appendTo($inner);

                if (i === index) {
                    //this to make transition more smooth
                    $wrap.addClass('popup-thumbnails-active');
                }

                $('<img />').load(function() {
                    $wrap.removeClass('loading');
                    $(this).appendTo($wrap);
                }).error(function() {
                    $wrap.removeClass('loading');
                    $wrap.removeClass('popup-thumbnails-active');
                    $(this).appendTo($wrap);
                }).attr('src', url);
            });

            $thumbnails.appendTo(Popup.$container);

            //bind click to thumb buttom 
            //note: Here has problem of DOM rendering on Opera
            // change to stop spread symtax
            $leftButtom.on('click', function(event) {
                moveEvent('left');
                event.stopPropagation();
            });
            $rightButtom.on('click', function() {
                moveEvent('right');
                event.stopPropagation();
            });
            $inner.children().on('click', function(event) {
                var index = $inner.children().index(this);
                Popup.show({}, index);
            });

            //store thumbnail DOM to obj
            this.$thumbnails = $thumbnails;
            this.$thumHolder = $thumHolder;
            this.$inner = $inner;
            this.visualWidth = visualWidth;
        },
        open: function(index) {
            var gallery = Popup.group;
            this.$inner.children().removeClass('popup-thumbnails-active').eq(index).addClass('popup-thumbnails-active');
        },
        afterLoad: function() {
            var index = Popup.current.index;

            if (!Popup.group || Popup.current.type !== 'image') {
                return
            }

            this.open(index);
            this.resetPosition(index);
        },

        //L:the distance from start to index of img,
        //v: visualWidth, unit: the length of every img including gap
        //left = left+(L-w)>0? -(L-w): left,
        //left = left+L<0? -(L-unit): left,
        resetPosition: function(index) {
            var inner = this.$inner,
                visualWidth = this.visualWidth,
                length = (index + 1) * (this.opts.unitWidth + 2 * this.opts.padding) + index * this.opts.gap,
                left = parseInt(inner.css('left'));

            if (left + length - visualWidth > 0) {
                left = visualWidth - length;
            } else if (left + length < 0) {
                left = this.opts.unitWidth + 2 * this.opts.padding - length;
            }

            inner.css({
                'left': left,
            });
        }
    };
    components.title = {
        $title: null,
        onReady: function() {
            if (!Popup.current.title) {
                return
            }
            this.create();
        },
        create: function() {
            var $title = $('<span>').addClass('popup-info-title').css({
                zIndex: 10
            });
            $title.appendTo(Popup.$info).text(Popup.current.title);
            this.$title = $title;
        },
        afterLoad: function() {
            if (!this.$title) {
                this.create();
            } else {
                this.$title.text(Popup.current.title);
            }
        },
        close: function() {
            this.$title = null;
        }
    };
    components.counter = {
        defaults: {},
        $count: null,
        total: null,
        onReady: function(instance,options) {
            if (!instance.isGroup) {
                return
            }
            this.create();

        },
        create: function() {
            var $count = $('<span>').addClass('popup-info-counter'),
                total = Popup.group.length,
                current = Popup.current.index + 1;
            $count.appendTo(Popup.$info).text(current + "/" + total).css({
                zIndex: 10
            });
            this.$count = $count;
            this.total = total;
        },
        afterLoad: function() {
            var current = Popup.current.index + 1;
            if (!Popup.group) {
                return
            }

            this.$count.text(current + "/" + this.total);
        }
    };


    // jQuery plugin initialization 
    $.fn.Popup = function(options) {
        var self = this,
            $self = $(self);

        function run() {
    
            $self.on('click', function(e) {
                var start,index,group,
                    data = [],
                    config = [];

                //filter the same popup-group name with the current click element as a group
                group = $self.filter(function() {
                    var data = $(this).data('popup-group');
                    if (metas.group) {
                        return data === metas.group;
                    }
                });

                if (group === undefined) {
                    group = $self;
                }

                $.each(group, function(i, el) {
                    var source = {},
                        metas = {};
                    // if doesnot have src property, ignore the element
                    if (el.href) {
                        source.link = el.href;
                        source.type = Util.checkType(el.src);
                    } else {
                        console.log('cant find link in the element');
                    }
                    data.push(source);

                    //get user options on DOM protperties and store them on metas object
                    $.each($(el).data(), function(k, v) {
                        if (/^popup/i.test(k)) {
                            metas[k.toLowerCase().replace(/^popup/i, '')] = v;
                        }
                    });
                    config.push(metas);
                });

                index = group.index(group);
                options = $.extend(true,options,config[index]);

                start = new Popup(data, options);
                start.elems = group;
                start.target = this;
                group.length >== 2 && start.isGroup = true;

                start.show(index);

                return false;
            });

            return start;
        }       

        return self.each(function() {
            if (!$.data(self, 'popup')) {
                $.data(self, 'popup', run());
            }
        });
    };

})(jQuery, document, window);


//extend some little function

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