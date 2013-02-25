
//register thumbnail
(function(){
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
})();