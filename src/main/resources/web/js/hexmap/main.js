
function require_config () {
    require.config({
        baseUrl: '/de.mikromedia.stableviews/js/hexmap',
        paths: {
            d3: '../../assets/vendor/d3.min',
            d3hexbin: '../../assets/vendor/d3-plugins/hexbin/hexbin',
            domReady: '../../assets/vendor/timeline/domReady',
            lang: '../label_dict_de'
        }
    })

    require(['modules/rest_client', 'modules/controller', 'domReady!'], function(restc, controller) {
        console.log("Hexmap Client initialized Controller and Rest Client", restc, controller)
        // ko.applyBindings(restc.get_clientside_model())
        controller.page_route()
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