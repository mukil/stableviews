
// Require config (common) to all ..

require.config({
    baseUrl: "/filerepo/dmx/stableviews/js/",
    paths: {
      d3: "/filerepo/dmx/stableviews/assets/vendor/d3.min"
    },
    shim: {
        'd3': {
            exports: 'd3'
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
