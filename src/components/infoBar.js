
// register infoBar component
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