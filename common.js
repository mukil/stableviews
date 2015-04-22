
// Require config (common) to all ..

require.config({
    baseUrl: "/app/stableviews/js/",
    paths: {
      d3: "/app/stableviews/assets/vendor/d3.min"
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
