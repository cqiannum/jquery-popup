;
(function($, document, window, undefined) {
    // Optional, but considered best practice by some
    "use strict";

    Popup.components.overlay = {
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
                if($(event.target).is('.popup-overlay') && Popup.current.winBtn) {
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
    Popup.components.controls = {
        defaults: {
            slider: true,
            ui: 'outside',
            autoPlay: false,
            action: false,
        },
        opts: {},
        active: false,

        onReady: function() {
            if(Popup.current.skin) {
                this.opts = $.extend({},this.defaults,Popup.current.components.controls);
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
                $prev = Popup._makeEls('div','popup-controls-prev'),
                $next = Popup._makeEls('div','popup-controls-next'),
                $close = Popup._makeEls('div','popup-controls-close'),
                $play = Popup._makeEls('div','popup-controls-play'),
                bindEvents = function() {
                    if(self.opts.action || self.opts.autoPlay) {
                        Popup.$content.on('click',function() {
                            if (Popup.current.isPaused === true) {
                                slider.play();
                            }
                            if (Popup.current.isPaused === false) {
                                slider.pause();
                            }
                        });
                    }
                    if(self.opts.action) {
                        Popup.$content.on('click',function() {
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

            Popup.$controls.append($prev,$play,$next,$close);

            $.extend(Popup,{
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
                Popup.$play.css({'display': 'block'});
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
            var top,left;
            if (!this.active || this.opts.ui !== 'outside') {
                return
            }

            top = (rez.winHeight - rez.holderHeight)/2;
            left = (rez.winWidth -rez.containerWidth - rez.holderWidth)/4;

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
    Popup.components.thumbnails = {
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
            
            this.opts = $.extend({},this.defaults,Popup.current.components.thumbnails);            
           
            this.create();
        },
        create: function() {
            var top, visualWidth,totalWidth,
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
                $leftButtom = $('<a href="#">').addClass('popup-thumbnails-left'),
                $rightButtom = $('<a href="#">').addClass('popup-thumbnails-right'),
                $thumHolder = $('<div>').addClass('popup-thumbnails-holder'),
                $inner = $('<div>').addClass('popup-thumbails-inner').appendTo($thumHolder),
                moveEvent = function(direction) {
                    var left =  $inner.css('left');

                    totalWidth = $inner.width();
                    left = parseInt(left);

                    if (direction == 'left') {
                        $inner.css({
                            'left': left-visualWidth<0? 0: (left-visualWidth),
                        });
                    } else {
                        $inner.css({
                            'left': -(left+visualWidth>totalWidth-visualWidth? totalWidth-visualWidth:left+visualWidth),
                        });
                    }
                };

            count = count > group.length? group.length:count; 
            visualWidth = count * (unitWidth+2*padding) + (count-1)*gap;

            //set necessary css style
            $inner.css({
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'width': group.length * (unitWidth+2*padding) + (group.length-1)*gap,
            });

            $thumHolder.css({
                'display':'inline-block',
                'position':'relative',
                'width': visualWidth,
                'height': unitHeight + 2* padding,
            });

            $thumbnails.css({
                'position': 'fixed',
                'bottom': bottom,
                'left': left,
                'text-align': 'center',
            }).append($leftButtom,$thumHolder,$rightButtom);

            //load image
            $.each(Popup.group,function(i) {
                var url = Popup.group[i].url,
                    $wrap = $('<a href="#">');

                if(url == undefined) { 
                    return 
                }

                $wrap.addClass('loading').appendTo($inner);

                if(i === index) {
                    //this to make transition more smooth
                    $wrap.addClass('popup-thumbnails-active');
                }

                $('<img />').load(function(){   
                    $wrap.removeClass('loading');         
                    $(this).appendTo($wrap);
                }).error(function(){
                    $wrap.removeClass('loading');
                    $wrap.removeClass('popup-thumbnails-active');
                    $(this).appendTo($wrap);
                }).attr('src', url); 
            });

            $thumbnails.appendTo(Popup.$container);

            //bind click to thumb buttom 
            $leftButtom.on('click',function() {

                moveEvent('left');
                return false;
            });
            $rightButtom.on('click',function() {
                moveEvent('right');
                return false;
            });
            $inner.children().on('click',function() {
                var index = $inner.children().index(this);
                Popup.show({},index);
            });

            //save var to obj
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
                length = (index +1)*(this.opts.unitWidth+2*this.opts.padding) + index*this.opts.gap,
                left = parseInt(inner.css('left'));

            if (left+length-visualWidth > 0) {
                left = visualWidth - length;
            } else if (left + length < 0) {
                left = this.opts.unitWidth + 2*this.opts.padding - length;
            }

            inner.css({
                'left': left,
            });
        }
    };
    Popup.components.title = {
        $title: null,
        onReady: function() {
            if (!Popup.current.title) {
                return
            }
            this.create();
        },
        create: function() {
            var $title = $('<span>').addClass('popup-info-title').css({zIndex:10});
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
    Popup.components.counter = {
        $count: null,
        total: null,
        onReady: function() {
            if (!Popup.group) {
                return
            }
            this.create();
        },
        create: function() {
            var $count = $('<span>').addClass('popup-info-counter'),
                total = Popup.group.length,
                current = Popup.current.index+1;
            $count.appendTo(Popup.$info).text(current+"/"+total).css({zIndex:10});
            this.$count = $count;   
            this.total = total; 
        },
        afterLoad: function() {
            var current = Popup.current.index+1;
            if (!Popup.group) {
                return
            }
           
            this.$count.text(current+"/"+this.total);           
        }
    };
    Popup.components.social = {
        defaults: {
            facebook: true,
            twitter: true,
        },
        opts: {},
        onReady: function() {
            this.opts = $.extend({},Popup.defaults,Popup.current.components.social);
            this.create();
        },
        create: function() {
            var $social = $('<div>').addClass('popup-info-social');
            for(var i in this.opts) {
                if (this.opts[i] == true) {

                }
            }
        },
        afterLoad: function() {},
        fackbook: function() {},
        twitter: function() {},
    };
    

})(jQuery, document, window);


