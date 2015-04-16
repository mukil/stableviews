
define(['rest_client'], function (restClient, require) {

    var restc = new restClient()

    function controllerBase(id) {
        this.id = id
    }

    controllerBase.prototype = {

        load_all_topicmaps: function (handler) {
            restc.fetchByTypeUriChilds("dm4.topicmaps.topicmap", function (result) {
                handler(result.items)
            }, null, null)
        },
        load_topicmap: function (id, handler) {
            restc.fetchTopicmapById(id, function (result) {
                handler(result)
            }, null, null)
        }
        
    }

    return controllerBase

});
