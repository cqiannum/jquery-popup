$.popup.registertheme('themeRimless', {
    buttomSpace: 120,

    autoSize: true,
    sliderEffect: 'zoom',

    components: {
        thumbnail: true,
        infoBar: true
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
});