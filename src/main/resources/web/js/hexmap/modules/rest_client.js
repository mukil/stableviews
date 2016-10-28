
define(['modules/model', 'd3'], function(model, d3) {

        return {

            load_topics_by_type: function (typeUri, callback) {

                // update gui
                d3.select('.data-container').style({'display': 'inline-block'})
                // issue request
                var xhr = d3.json('/core/topic/by_type/' + typeUri)
                    xhr.get()
                    xhr.on('load', function (data) {
                        // update model
                        model.set_items(data)
                        // callback
                        if (typeof callback !== "undefined") callback(data)
                    })
                    xhr.on('error'), function (error) {
                        console.log("d3.error:: " + error)
                        throw Error("Hexmap Rest Client, loading topics by type " + error)
                    }

            },

            get_username: function (callback) {
                /** ### send synchronous request */
                var xhr = d3.xhr('/accesscontrol/user', "text/plain")
                    xhr.get()
                    xhr.on('load', function (data) {
                        if (callback) callback(data.responseText)
                    })
                    xhr.on('error'), function (error) {
                        console.log("d3.error:: " + error)
                        throw Error("notes_rest_client::is_logged_in " + error)
                    }
            },

            get_clientside_model: function () {
                return model
            }

        }

    }
)