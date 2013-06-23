/*! Popup - v0.1.0 - 2013-02-04
* https://github.com/amazingSurge/popup
* Copyright (c) 2013 amazingSurge; Licensed CC, BY-NC */
(function($) {

  // Collection method.
  $.fn.awesome = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      var hvello;
      hvello = 1;
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.awesome = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.awesome.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.awesome.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].awesome = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
