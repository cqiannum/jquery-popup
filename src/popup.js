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
    var Popup = $.Popup = function(element, options) {

        this.element = element;
        this.$element = $(element);

        this.index = 0;
        this.$group = null;
        this.current = null;
        
        this.datapool = {};   

        this.isGroup = false;

        // for cache basic component in html    
        this.initialized = false;

        // for gallery
        this.active = false;

        this.css3Transition = false;

        this.options = $.extend({}, Popup.defaults, this.themes[options.themes], options);
        this.namespace = this.options.namespace;

        this.init();
    };
    Popup.prototype = {
        constructor: Popup,

        themes: {},
        componnets: {},
        types: {},
        transtions: {},
        effects: {}, 

        init: function() {
            var self = this,
                metas = this.getConfig(this.$element);

            // filter group from collects
            this.$group = this.options.collects.filter(function() {
                var data = $(this).data('popup-group');
                if (metas.group) {
                    return data === metas.group;
                }
            });

            this.index = this.$group.index(this);  

            if (this.$group && this.$group.length > 1) {
                this.isGroup = true;
            } 

            this.initialized = true;
        },

        getConfig: function($element) {
            var metas = {};
            $.each($element.data(), function(k, v) {
                if (/^popup/i.test(k)) {
                    metas[k.toLowerCase().replace(/^popup/i, '')] = v;
                }
            }); 

            return metas;
        },
        create: function() {
            // overlay and container
        },
        show: function(index) {
            var metas = this.getConfig(this.$collects[index]);

            this.current = $.extend({}, this.options, metas);

            if (this.active === true) {
                this.create();
            }

            if (this.css3Transition === true) {
                this.$overlay.addClass(this.options.transtion);
            } else {
                // change to jquery animation

            }

            this.showLoading();
            this.load(this.hideLoading, );
        },
        hide: function() {},
        load: function(callback) {},

        next: function() {},
        prev: function() {},
        goTo: function() {},
        cancel: function() {},
        close: function() {},

        update: function() {},
        destroy: function() {},

        showLoading: function() {},
        hideLoading: function() {},

        resize: function() {},
        preload: function() {},

        getCurrentPage: function() {}

    };

    Popup.prototype.types = {
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
        html5Video: {
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

                            current.content = content;


                            instance._afterLoad();
                        }
                    }
                }));
            }
        }
    };
    Popup.prototype.themes = {
        defaults: {},
        skinRimless: {
            buttomSpace: 120,

            autoSize: true,
            sliderEffect: 'zoom',

            components: {
                thumbnail: true,
                infoBar: true
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
        }      
    };

    Popup.prototype.componnets = {

    };
    Popup.prototype.transitions = {

    };
    Popup.prototype.effects = {

    };

    // static Method

    Popup.registerTheme = function(name, options) {};
    Popup.registerComponent = function(name, options) {};
    Popup.registerType = function(name, options) {};
    Popup.registerTransition = function(name, options) {};
    Popup.registerEffect = function(name, options) {};

    Popup.defaults = {
        tpl: '<div>'
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
            options.collects = this;

            return this.each(function() {
                if (!$.data(this, 'popup')) {
                    $.data(this, 'popup', new Popup(this, options));
                }
            });
        }
    };

})(jQuery, document, window);




