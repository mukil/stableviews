
// Require config (common) to all ..

require.config({
    baseUrl: "/de.mikromedia.stableviews/js/modules/",
    paths: {
        d3: "/de.mikromedia.stableviews/assets/vendor/d3.min",
        jQuery: "/de.mikromedia.stableviews/assets/vendor/jquery/jquery-2.1.4.min",
        dropdown: "/de.mikromedia.stableviews/assets/css/semantic-ui/dropdown.min",
        transition: "/de.mikromedia.stableviews/assets/css/semantic-ui/transition.min"
    },
    shim: {
        'd3': {
            exports: 'd3'
        },
        'jQuery': {
            exports: 'jQuery'
        },
        'dropdown': {
            exports: 'dropdown'
        },
        'transition': {
            exports: 'transition'
        }
    },
    waitSeconds: 15
})

define(function () {
    return {
        debug: true,
        fine: false
    }
})
