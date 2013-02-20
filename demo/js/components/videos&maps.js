;
(function($, document, window, undefined) {
    // Optional, but considered best practice by some
    "use strict";

    //configuration
    $.popup.videoregs: {
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
    };
    $.popup.mapsreg: {
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
    };

    //extend $.popup.types to achieve videos and maps
    $.extend($.popup.types,{
        video: {
            match: function(url){
                var videoid,
                    href = url,
                    type = Popup.current.type;

                if (Popup.current.type !== 'video') { return false }

                $.each(Popup.videoregs, $.proxy(function(i, e) {  
                    if (href.split('?')[0].match(e.reg)) {

                        if (e.split) {
                            videoid = href.split(e.split)[e.index].split('?')[0].split('&')[0];
                            Popup.current.url = e.url.replace("%id%", videoid);
                        }
                        Popup.current.type = e.iframe ? 'iframe' : e.vhtml5 ? 'vhtml5' : 'swf';

                        return false;
                    }
                }, this));

                return true;
            },
        },
        map: {
            match: function(url){
                var href = url,id;
                if (Popup.current.type !== 'map') { return false; }
                $.each(Popup.mapsreg, function(i, e) {
                    if (href.match(e.reg)) {
                        Popup.current.type = 'iframe';
                        if (e.split) {
                            id = href.split(e.split)[e.index];
                            href = e.url.replace("%id%", id).replace("%width%", Popup.current.width).replace("%height%", Popup.current.height);
                        }

                        return false;
                    }
                });
                return true;
            },      
        },
    });

})(jQuery, document, window);


