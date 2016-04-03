
define(['modules/model', 'd3'], function(model, d3) {

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

            load_timerange_index: function (since, to, callback) {

                // var now = new Date().getTime()
                // var since = Date.parse("2015")
                // update gui
                d3.select('.data-container').style({'display': 'inline-block'})
                // issue request
                var xhr = d3.json('/helpers/timeindex/' + model.get_timestamp_option() + '/' + since + '/' + to)
                    xhr.get()
                    xhr.on('load', function (data) {
                        // update model
                        model.set_timerange(data)
                        // update gui
                        d3.select('.data-container').style({'display': 'none'})
                        // callback
                        if (typeof callback !== "undefined") callback(since, to)
                    })
                    xhr.on('error'), function (error) {
                        console.log("d3.error:: " + error)
                        throw Error("Timeline Rest Client, loading timeindex" + error)
                    }
            },

            load_topics_in_range: function (since, to, callback) {

                // update model
                model.set_from_time(since)
                model.set_to_time(to)
                // update gui
                d3.select('.data-container').style({'display': 'inline-block'})
                // issue request
                var xhr = d3.json('/helpers/by_time/' + model.get_timestamp_option() + '/' + since + '/' + to)
                    xhr.get()
                    xhr.on('load', function (data) {
                        model.set_items(data)
                        // update gui
                        d3.select('.data-container').style({'display': 'none'})
                        d3.select('.timeline-info').style({'display': 'inline-block'})
                        d3.select('.timeline-info .state.items').text(data.length)
                        // callback
                        if (typeof callback !== "undefined") callback()
                    })
                    xhr.on('error'), function (error) {
                        console.log("d3.error:: " + error)
                        throw Error("Timeline Rest Client, loading topics in range" + error)
                    }

            },

            is_logged_in: function () {
                /** ### send synchronous request
                 *var xhr = d3.json('/accesscontrol/user')
                    xhr.get()
                    xhr.on('load', function (data) {
                        console.log(data)
                    })
                    xhr.on('error'), function (error) {
                        console.log("d3.error:: " + error)
                        throw Error("notes_rest_client::is_logged_in " + error)
                    } **/
            },

            get_clientside_model: function () {
                return model
            }

        }

    }
)