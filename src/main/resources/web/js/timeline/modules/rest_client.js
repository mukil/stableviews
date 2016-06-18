
define(['modules/ko_page_impl', 'd3'], function(model, d3) {

        return {

            // ### currently un-available on server side
            load_some_notes: function (amount, offset) {
                var xhr = d3.json('/helpers/fetch/' + amount + '/' + offset)
                    xhr.get()
                    xhr.on('load', function (data) {
                        model.items.all(data)
                    })
                    xhr.on('error'), function (error) {
                        console.log("d3.error:: " + error)
                        throw Error("Timeline Rest Client, fetching topics" + error)
                    }
            },

            load_timerange_index: function (callback) {

                var since = model.get_max_from_time()
                var to = model.get_max_to_time()
                console.log("Querying Topic Index (Right Side) Since", new Date(since), "To", new Date(to))
                // var now = new Date().getTime()
                // var since = Date.parse("2015")
                // issue request
                var xhr = d3.json('/helpers/timeindex/' + model.get_timestamp_option() + '/' + since + '/' + to)
                    xhr.get()
                    xhr.on('load', function (data) {
                        // update model
                        model.set_timerange(data)
                        // callback
                        if (typeof callback !== "undefined") callback(since, to) // fixme
                    })
                    xhr.on('error'), function (error) {
                        console.log("d3.error:: " + error)
                        throw Error("Timeline Rest Client, loading timeindex" + error)
                    }
            },

            load_topics_in_range: function (callback) {

                // update model
                var since = model.get_from_time()
                var to = model.get_to_time()
                console.log("Querying Timeline (Left Side) Since", new Date(since), "To", new Date(to))
                // update gui
                d3.select('.data-container').style({'display': 'inline-block'})
                // issue request
                var xhr = d3.json('/helpers/by_time/' + model.get_timestamp_option() + '/' + since + '/' + to)
                    xhr.get()
                    xhr.on('load', function (data) {
                        // update model
                        model.set_items(data)
                        // callback
                        if (typeof callback !== "undefined") callback()
                    })
                    xhr.on('error'), function (error) {
                        console.log("d3.error:: " + error)
                        throw Error("Timeline Rest Client, loading topics in range" + error)
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