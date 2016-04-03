
function require_config () {
    require.config({
        baseUrl: '/de.mikromedia.stableviews/js/timeline',
        paths: {
            knockout: '../../assets/vendor/timeline/knockout-3.1.0',
            d3: '../../assets/vendor/d3.min',
            domReady: '../../assets/vendor/timeline/domReady',
            labels: '../../js/label_dict'
        }
    })

    require(['knockout', 'modules/rest_client', 'modules/controller', 'domReady!'],
    function(ko, restc, notes_route) {
        ko.applyBindings(restc.get_clientside_model())
        console.log("Timeline Client initialized Knockout based Controller and Model")
        notes_route.page_route()
    });

    /**
    require(['async', 'knockout', 'knockout_mapping', 'd3'],
    function(async, ko, ko_mapping, d3) {
        console.log("async, ko, ko-mapping and d3 are loaded")
        //This function is called when scripts/helper/util.js is loaded.
        //If util.js calls define(), then this function is not fired until
        //util's dependencies have loaded, and the util argument will hold
        //the module value for "helper/util".
    }) **/

}
require_config()