# jQuery popup

The powerful jQuery plugin that creates all kinds of pop up effect. <a href="http://amazingsurge.github.io/jquery-popup/">Project page and demos</a><br />
Download: <a href="https://github.com/amazingSurge/jquery-popup/archive/master.zip">jquery-popup-master.zip</a>

***

## Features

* **Keyboard control support** — use `left/right`key to switch pre/next image,`esc`to close
* **AJAXed popup support** — ajax load content support
* **Video and animation playback support** — popup provides the function of video and animation play
* **Lightweight size** — 1 kb gzipped

## Dependencies
* <a href="http://jquery.com/" target="_blank">jQuery 1.83+</a>

## Usage

Import this libraries:
* jQuery
* jquery-popup.min.js

And CSS:
* popup.css and core.css 


Create base html element:
```html
    <div class="example">
        <a class="popup-image" href="img/1.jpg" data-popup-transition="fade" data-popup-title='this is a image' data-popup-skin='skinRimless'>
            <img src="img/1-thumbnail.jpg" alt="" />
        </a>
    </div>
```

Initialize tabs:
```javascript
$(".popup-image").popup();
```

Or initialize tabs with custom settings:
```javascript
$(".popup-image").popup({
namespace: 'popup',
    theme: 'default',
    modalEffect: 'none',
    winBtn: true,
    keyboard: true,
    autoSlide: false,
    playSpeed: 1500,
    preload: false,
    thumbnail: false,
});
```

## Settings

```javascript
{   

    // Optional property, Set a namespace for css class
    namespace: 'popup',
    
    //Optional property, set transition effect, it works after you load specified theme file
    theme: 'default',

    //Optional property, if 'none',we can close at once needn't to give time to render css3 transition
    modalEffect: 'none',

    //Optional property, if true and when the target elements has class<code>namespace + '-container'</code>, it's can be closed.
    winBtn: true,

    //Optional property, if true, the keyboard control is activated
    keyboard: true,

    //Optional property, if true, the images will auto slide
    autoSlide: false,

    //Optional property,  set the interval time between one image and anther
    playSpeed: 1500,

    //Optional property, if true, the next image will be loaded
    preload: false,

    //Optional property, set the parameters for ajax
    ajax: {
        render: function(data) {
            return $(data);
        },
        options: {
            dataType: 'html',
            headers: {
                 popup: true
            }
        }
    },

    //Optional property, set the parameters for swf
    swf: {
        allowscriptaccess: 'always',
        allowfullscreen: 'true',
        wmode: 'transparent',
        },

    //Optional property, set the parameters for html5
    html5: {
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
        source: null
    },

    //Optional property, if true, the component of thumbnails can be activation
    thumbnail: false,

    //set the template
    tpl: {
        overlay: '<div class="popup-overlay"></div>',
        container: '<div class="popup-wrap">' + '<div class="popup-container">' + '<div class="popup-content-wrap">' + '<div class="popup-content-holder">' + '<div class="popup-content">' + '</div>' + '<div class="popup-infoBar">' + '<div class="popup-title"></div>' + '<span class="popup-counter"></span>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>',
        loading: '<div class="popup-loading">loading...</div>',
        close: '<button title="Close" type="button" class="popup-close">x</button>',
        next: '<button title="next" type="button" class="popup-navigate popup-next"></button>',
        prev: '<button title="prev" type="button" class="popup-navigate popup-prev"></button>'
    }
}
```

## Public methods

jquery popup has different methods , we can use it as below :
```javascript
// start to activate
$(".popup-image").popup("open");

// loading the target element
$(".popup-image").popup("goto");

// go to next
$(".popup-image").popup("next");

// go to prev
$(".popup-image").popup("prev");

// close the target element
$("popup-image").popup("close");

```

## Event / Callback

* <code>popup::init</code>: trigger when popup initilize
* <code>popup::create</code>: trigger when the framework of popup is created
* <code>popup::close</code>: trigger when popup is going to cloing
* <code>popup::change</code>: trigger when popup is going to changing
* <code>popup::resize</code>: trigger when the size of viewport is changed
* <code>popup::preload</code>: trigger when popup need to preload

how to use event:
```javascript
$(document).on('popup::init', function(event,instance) {
    // instance means current popup instance 
    // some stuff
});
```

## Browser support
jquery-popup is verified to work in Internet Explorer 7+, Firefox 2+, Opera 9+, Google Chrome and Safari browsers. Should also work in many others.

Mobile browsers (like Opera mini, Chrome mobile, Safari mobile, Android browser and others) is coming soon.

## Changes

| Version | Notes                                                            |
|---------|------------------------------------------------------------------|
|   0.3.x | ([compare][compare-1.3]) add thumbnails function                    |
|   0.2.x | ([compare][compare-1.2]) add autoside function                    |
|   0.1.x | ([compare][compare-1.1]) add keyboard function                   |
|     ... | ...                                                              |

[compare-1.3]: https://github.com/amazingSurge/jquery-popup/compare/v1.3.0...v1.4.0
[compare-1.2]: https://github.com/amazingSurge/jquery-popup/compare/v1.2.0...v1.3.0
[compare-1.1]: https://github.com/amazingSurge/jquery-popup/compare/v1.1.0...v1.2.0

## Author
[amazingSurge](http://amazingSurge.com)

## License
jQuery-popup plugin is released under the <a href="https://github.com/amazingSurge/jquery-popup/blob/master/LICENCE.GPL" target="_blank">GPL licence</a>.


