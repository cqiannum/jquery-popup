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
    var Popup = $.Popup = function(data, options) {
        

        this.index = 0;
        this.collections = null;
    };
    Popup.prototype = {
        constructor: Popup,

        theme: {},
        componnets: {},
        types: {},
        transtion: {},
        effect: {}, 

        init: function() {},
        show: function() {},
        hide: function() {},
        load: function() {},

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

        getCurrentPage: function() {}

    };

    Popup.registerTheme = function() {};
    Popup.registerComponent = function() {};
    Popup.registerType = function() {};
    Popup.registerTransition = function() {};
    Popup.registerEffect = function() {};

    Popup.defaults = {
        tpl: {
            overlay: '',
            container: '',
            error: ''
        }
    };




    // jQuery plugin initialization 
    $.fn.Popup = function(options) {
        
    };

})(jQuery, document, window);




