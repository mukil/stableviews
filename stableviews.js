
// Load common code that includes config, then load the app logic for this page.
require(['common'], function (common) {

    require(['graph_panel', 'stableviews_ctrl'], function (graph_panel, controller) {

        var username = undefined            // 
        var topicmaps = undefined           //
        var selected_topicmap = undefined   //
        var selected_topic = undefined      //
        var suggestions = undefined         //

        // 0) ..
        graph_panel.init()

        graph_panel.listen_to('selection', function (e) {
            if (common.debug) console.log(" > selection ", e.detail)
            controller.load_topic(e.detail.id, function (topic) {
                selected_topic = topic
                graph_panel.set_title(topic.value)
                if (common.debug) console.log(" > Loaded Topic ", topic)
                if (selected_topic.type_uri === "dm4.notes.note") {
                    console.log("set text...")
                    graph_panel.set_description(selected_topic.childs['dm4.notes.text'].value)
                } else {
                    console.log("clearing text")
                    graph_panel.set_description('')
                }
            })
        })

        graph_panel.listen_to('multi_selection', function (e) {
            if (common.debug) console.log(" > multi_selection ", e.detail)
        })

        graph_panel.listen_to('rendered_topicmap', function (e) {
            if (common.debug) console.log(" > rendered topicmap ", e.detail)
        })

        graph_panel.listen_to('topicmap_transformed', function (e) {
            if (common.debug) console.log(" > topicmap transformed ", e.detail)
        })

        // 1) ..
        controller.load_all_topicmaps ( function (response) {

            topicmaps = response
            selected_topicmap = topicmaps[0]

            // 1.2) ..
            controller.load_topicmap (selected_topicmap.id, function (result) {

                selected_topicmap = result
                graph_panel.show_topicmap(selected_topicmap)

            })

        })

        // --- Setup command line input area

        d3.select('#todoinput').on('keypress', function() {

            if (d3.event.keyCode === 13 && d3.event.target.value.length > 2) {

                var user_input = d3.event.target.value
                // ##### here is where the magic starts: our first command "open" maps to "show topicmap"
                if (user_input.startsWith("open")) {
                    var index = parseInt(user_input.split(" ")[1]) - 1
                    if (index > topicmaps.length)
                       throw Error ("Could not load topicmap " + index + " with just " + topicmaps.length + " loaded")
                    selected_topicmap = topicmaps[index]
                    load_selected_topicmap()

                } else if (user_input.startsWith("?")) {

                    var idx = user_input.split(" ")[1]
                    // depends on dm4-little-helpers module installed
                    restclient.getTopicSuggestions(idx.trim(), function (items) {

                        console.log("clq: ", items)
                        suggestions = items

                    }, null, false)

                }

                // clear command line
                d3.event.target.value = ''
            }

        })

        // --- Focus command line on startup
        document.getElementById('todoinput').focus()

        // -- Login View

        function render_login_dialog () {

            /** function do_auth() {
                var element = d3.select('input.vp-id')[0][0]
                newCtrl.startSession(element.value, function (){
                    window.location.reload()
                }, common.debug)
            } **/
        }

        function load_selected_topicmap () {

            controller.load_topicmap (selected_topicmap.id, function (result) {

                graph_panel.clear_panel()

                selected_topicmap = result
                graph_panel.show_topicmap(selected_topicmap)

            })
        }

        return {}

    })

    // console.log(stable)
    // stable.show_topicmap(1)

})
