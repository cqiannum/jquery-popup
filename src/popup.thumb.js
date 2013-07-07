// components:: thumbnails
(function(document, undefined) {
    var $doc = $(document);
    var thumbnail = {
        tpl: '<div class="popup-thumb-wrap">' + '<button class="popup-thumb-prev" alt="prev">prev</button>' + '<div class="popup-thumb">' + '<ul class="popup-thumb-items"></ul>' + '</div>' + '<button class="popup-thumb-prev" alt="next">next</buttom>' + '</div>',
        map: {
            none: '',
            iframe: '',
            ajax: '',
            vhtml5: ''
        },

        init: function(instance) {
            var items = '',
                self = this,
                data = instance.group;

            this.$tpl = $(this.tpl);
            this.$thumb = this.$tpl.find('.popup-thumb');
            this.$items = this.$tpl.find('.popup-thumb-items');
            this.$prev = this.$tpl.find('.popup-thumb-prev');
            this.$next = this.$tpl.find('.popup-thumb-next');

            this.total = data.length;
            this.index = 0;
            this.posIndex = 0;
            this.showCount = 8;
            this.width = 75;

            //here add thumbnail
            $.each(data, function(i, v) {
                var url, img = new Image();
                if (v.options && v.options.thumb) {
                    url = v.options.thumb;
                } else if (self.map[v.type]) {
                    url = self.map[v.type];
                } else {
                    url = sel.map.none;
                }

                img.src = url;
                $('<li></li>').append(img).appendTo(self.$items);
            });

            // fixme: change this ugly code
            this.$items.css({
                width: this.total * 75
            });

            this.$prev.on('click', $.proxy(this.prev, this));
            this.$next.on('click', $.proxy(this.prev, this));
            this.$thumb.delegate('li', 'click', function(event) {
                var index = self.$items.find('li').index(this);
                instance.goto(index);
                return false;
            });

            this.$tpl.appendTo(instance.$container);

            this.resize(instance);
            this.active(instance.index);
        },
        close: function(instance) {
            this.unbindEvent();
            this.$tpl.remove();
            instance.$container.removeClass('popup-thumb-layout');
        },
        active: function(index) {
            var className = 'popup-thumb-active';
            this.$items.find('.popup-thumb-active').removeClass(className);
            this.$items.find('li').eq(index).addClass(className);

            this.index = index;
            this.resetPos(index);
        },
        resetPos: function(index) {
            var value = index * 75;

            if (index >= this.posIndex && index < this.showCount + this.posIndex) {
                return false;
            } else if (index < this.posIndex) {
                this.posIndex = index;
                value = index * this.width;
            } else {
                this.posIndex = this.showCount + 2 * this.posIndex - index + 1;
                value = this.posIndex * this.width;
            }

            this.$items.css({
                'margin-left': -value
            });
        },
        prev: function() {
            var index = this.posIndex;
            index--;
            if (index < 0) {
                index = this.total - 1;
            }
            this.resetPos(index);
            return false;
        },
        next: function() {
            var index = this.posIndex;
            index++;
            if (index >= this.total) {
                index = 0;
            }
            this.resetPos(index);
            return false;
        },
        unbindEvent: function() {
            this.$prev.off('click');
            this.$next.off('click');
            this.$items.undelegate('click');
        },
        setShowCount: function(index) {
            this.showCount = index;
            if (this.total < this.showCount) {
                this.showCount = this.total;
            }
        },
        resize: function(instance) {
            var index,
            viewport = instance.$container.width();

            // fixme: just for demo
            if (viewport < 500) {
                this.$tpl.css({
                    display: 'none'
                });
                instance.$container.removeClass('popup-thumb-layout');
                return false;
            } else {
                this.$tpl.css({
                    display: 'block'
                });
                instance.$container.addClass('popup-thumb-layout');
            }

            index = Math.round(viewport * 0.8 / this.width);
            this.setShowCount(index);
        }
    };

    $doc.on('popup::create', function(event, instance) {
        if (instance.options.thumbnail) {
            instance.$container.addClass('popup-thumb-layout');
            thumbnail.init(instance);
        }
    });
    $doc.on('popup::change', function(event, instance) {
        if (instance.options.thumbnail) {
            thumbnail.active(instance.index);
        }
    });
    $doc.on('popup::close', function(event, instance) {
        if (instance.options.thumbnail) {
            thumbnail.close(instance);
        }
    });
    $doc.on('popup::resize', function(event, instance) {
        if (instance.options.thumbnail) {
            thumbnail.resize(instance);
        }
    });
    $doc.on('popup::preload', function(event, instance) {

    });
})(document);