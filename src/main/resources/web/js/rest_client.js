
define(['d3'], function(d3, require) {

    function restClient() {}

    function fetch(resource, callback, failure, json, debug) {
        var response_type = "text/plain"
        if (json) response_type = "application/json"
        var xhr = d3.xhr(resource, response_type)
            xhr.get()
            xhr.on('load', function(response) {
                var result = undefined
                if (response !== null) {
                    result = response
                    if (debug) console.log(response.status, response)
                    if (response.status === 200) {
                        // process response
                        if (json) {
                            result = JSON.parse(response.response)
                        } else {
                            result = response.response
                        }
                    }
                    if (typeof callback === "function") callback(result)
                }
            })
            xhr.on('error', function(error) {
                if (typeof failure === "function") failure(error)
            })
    }
    
    function mark(resource, callback, fail) {
        var xhr = d3.xhr(resource)
            xhr.get()
            xhr.on('load', callback)
            xhr.on('error', function(e){
                if (typeof fail !== "undefined") fail(e)                
            })
    }
    
    function post(resource, data, callback, fail, json, debug) {
        var response_type = "application/json"
        var xhr = d3.xhr(resource, response_type)
            xhr.header('Content-Type', "application/json")
            xhr.post(JSON.stringify(data))
            xhr.on('load', function(response) {
                if (debug) console.log(response)
                if (json && typeof callback !== "undefined") {
                    // process response
                    var result = undefined
                        result = JSON.parse(response.response)
                    if (debug) console.log(response.status, result)
                    if (response.status !== 200 && response.status !== 204) throw Error(response.status)
                    if (typeof callback !== "function") throw Error("Please always specify a response "
                        + "handler when calling restClient for async HTTP")
                    callback(result)
                } else if (typeof callback !== "undefined") {
                    callback()
                }
            })
            xhr.on('error', function(e) {
                console.warn(e.status, e.statusText)
                if (typeof fail !== "undefined") fail(e)
            })
    }
    
    function authenticate(username, passwd, handle, fail, debug) {
        var xhr = d3.xhr('/accesscontrol/login')
        var auth_code = authorization()
            xhr.header('Content-Type', "application/json")
            xhr.header('Authorization', auth_code)
            xhr.post()
            xhr.on('load', function(response) {
                if (debug) console.log(response)
                if (typeof handle !== "undefined") handle(response)

            })
            xhr.on('error', function(e) {
                console.warn(e.status, e.statusText)
                if (typeof fail !== "undefined") fail(e)
            })
            
            /** Returns value for the "Authorization" header. */
            function authorization() {
                var code = btoa(username + ":" + passwd)
                return "Basic " + code
            }
    }

    restClient.prototype = {

        fetchUsername: function(handle, debug) {
            fetch('/accesscontrol/user', handle, undefined, false, debug)
        },
        fetchAllTopicTypes: function(handle, fail, debug) {
            fetch('/core/topictype/all', handle, fail, true, debug)
        },
        fetchAllAssocTypes: function(handle, fail, debug) {
            fetch('/core/assoctype/all', handle, fail, true, debug)
        },
        fetchByTypeUri: function(typeUri, handle, fail, debug) {
            fetch('/core/topic/by_type/' + typeUri, handle, fail, true, debug)
        },
        fetchByTypeUriChilds: function(typeUri, handle, fail, debug) {
            fetch('/core/topic/by_type/' + typeUri + '?include_childs=true', handle, fail, true, debug)
        },
        fetchTopicmapById: function(topicmapId, handle, fail, debug) {
            fetch('/topicmap/' + topicmapId, handle, fail, true, debug)
        },
        fetchTopicById: function(topicId, handle, fail, debug) {
            fetch('/core/topic/' + topicId + '?include_childs=true', handle, fail, true, debug)
        },
        getTopicSuggestions: function(query, handle, fail, debug) {
            fetch('/helpers/suggest/topics/' + query, handle, fail, true, debug)
        },
        postPayload: function(topicId, payload, handle, fail, debug) {
            post('/test/' + topicId, payload, handle, fail, false, debug)
        },
        doMarkTopic: function(topicId, callback, fail) {
            mark('/test/' + topicId + "/seen", callback, fail)
        },
        startSession: function(id, key, handle, fail, debug) {
            authenticate(id, key, handle, fail, debug)
        },
        stopSession: function (callback, fail) {
            post('/accesscontrol/logout', undefined, callback, fail)
        }

    }

    return restClient
    
})
