
define(['rest_client'], function(restClient, require) {

    var restc = new restClient()

    function controllerBase(id) {
        this.id = id
    }

    controllerBase.prototype = {

        loadAllTopicTypes: function(handler) {
            restc.fetchAllTopicTypes(function (result) {
                handler(result)
            }, null, null)
        },
        loadAllAssocTypes: function(handler) {
            restc.fetchAllAssocTypes(function (result) {
                handler(result)
            }, null, null)
        },
        loadAllTopicmaps: function(handler) {
            restc.fetchByTypeUriChilds("dmx.topicmaps.topicmap", function (result) {
                handler(result)
            }, null, null)
        },
        loadAllWorkspaces: function(handler) {
            restc.fetchByTypeUriChilds("dmx.workspaces.workspace", function (result) {
                handler(result)
            }, null, null)
        },
        loadTopicmap: function(id, handler) {
            restc.fetchTopicmapById(id, function (result) {
                handler(result)
            }, null, null)
        },
        loadTopic: function(id, handler) {
            restc.fetchTopicById(id, function (result) {
                handler(result)
            }, null, null)  
        },
        searchTopics: function(query, handler) {
            restc.getTopicSuggestions(query, handler, function (e){
                console.warn("restc.getTopicSuggestions ", e)
            }, false)
        },
        loadUsername: function(handler, debug) {
            return restc.fetchUsername(handler, debug)
        },
        updateTopicPosition: function(topicId, topicmapId, pos, fail, debug) {
            return restc.updateTopicPosition(topicId, pos, topicmapId, fail, debug)
        },
        startSession: function(username, pass, handler, failure, debug) {
            return restc.startSession(username, pass, handler, failure, debug)
        },
        stopSession: function(handler, fail) {
            return restc.stopSession(handler, fail)
        }
        
    }

    return controllerBase

});
