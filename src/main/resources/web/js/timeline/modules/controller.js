
define(['knockout'], function(ko) {

    return {

        page_route: function(hello) {
            // parse requested location
            var pathname = window.location.pathname
            var attributes = pathname.split('/')
            var viewId = attributes[3]
            var topicId = attributes[4]
            
            console.log("Timeline Controller", hello, "View ID", viewId, "Topic ID", topicId)

            // additional resource to bootstrap the app
            if (viewId === "timeline") {

                require(['modules/timeline'], function (view) {  // circular dependency
                    view.init()
                })

            // ### not implemented yet
            } else if (topicId === undefined || topicId === "") {

                // _this.prepare_index_page(true, false) // load timeline with no filter set
                require(['modules/timeline'], function (view) {  // circular dependency
                    view.init()
                })

            // ### not implemented yet (was filtered timeline)
            } else if (topicId === "tagged") {

                // 2) setup filtered timeline-view
                var tags = attributes[3]
                    tags = (tags.indexOf('+') != -1) ? tags.split("+") : tags.split("%2B")
                // var selectedTag = undefined
                for (var i=0; i < tags.length; i++) {
                    var label = decodeURIComponent(tags[i])
                    // selectedTag = _this.model.getTagByName(label)
                    // if (selectedTag != undefined) _this.model.addTagToFilter(selectedTag)
                }
                // _this.prepare_index_page(true, false) // call timeline after filter was set.
                console.log("=> Filtered Timeline View - NYI")

            // ### not implemented yet (user timeline)
            } else if (topicId === "user") {
                // 3) setup personal timeline view
                var userId = attributes[3]
                // _this.prepare_profile_page(user, true, false)
                console.log("=> Profile Timeline View - NYI")

            // ### not implemented yet (topic detail view)
            } else {
                // 4) setup detail view
                // _this.prepare_detail_page(noteId)
                // fixme: historyApi // _this.pushHistory("detailView", "Note Info: " + noteId, "/notes/" + noteId)
                console.log("=> Topic Detail Timeline")

            }
        },

        render_item_content: function (item) {

            require(['modules/timeline'], function (view) { // circular dependency
                view.render_details_in_list(item)
            })

        },

        adjust_timerange: function() {

            require(['modules/timeline'], function (view) { // circular dependency
                view.toggle_timerange_settings()
            })

        }

    }
})
