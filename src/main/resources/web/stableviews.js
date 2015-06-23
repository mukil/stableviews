
// Load common code that includes config, then load the app logic for this page.
require(['common'], function (common) {

    require(['graph_panel', 'stableviews_ctrl'], function (graph_panel, controller) {

        // authenticated staff only stuff
        var username = undefined            //
        var workspaces = undefined          //

        // topic map and selection stuff
        var topicmaps = undefined           //
        var selected_topicmap = undefined   //
        var selected_topic = undefined      //
        var multi_selection = []            //

        // command line related stuff
        var search_results = []             // latest search results of customa auto-completion method
        var topic_commands = []             // basic set of commands for a given topic
        var reverse_search = []             // list of recently executed commands (non-persistent)

        // 0) ..
        graph_panel.init()

        // ### Currently, yll these listeners get cleared out with map-panel when switching topicmap

        graph_panel.listen_to('selection', function (e) {
            if (common.debug) console.log(" > selection ", e.detail)

            controller.load_topic(e.detail.id, function (topic) {
                // update client side model (as a param for commands)
                selected_topic = topic
                multi_selection = []
                graph_panel.highlight_topic(selected_topic.id)
                // render
                graph_panel.set_title(topic.value)
                if (selected_topic.type_uri === "dm4.notes.note") {
                    graph_panel.set_description(selected_topic.childs['dm4.notes.text'].value)
                } else {
                    graph_panel.set_description('')
                }
            })
        })

        graph_panel.listen_to('multi_selection', function (e) {
            // update client side model (as a param for commands)
            multi_selection = e.detail
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
            controller.load_topicmap(selected_topicmap.id, function (result) {
                //
                selected_topicmap = result
                graph_panel.show_topicmap(selected_topicmap)

            })

        })

        // --- Setup command line input area
        // --- ### setup gui for autocompletion

        d3.select('#todoinput').on('keypress', function() {

            if (d3.event.keyCode === 13 && d3.event.target.value.length > 2) {

                var user_input = d3.event.target.value.trim()
                // ##### here is where the magic starts: our first command "open" maps to "show topicmap"
                if (user_input.startsWith("open")) {
                    var index = parseInt(user_input.split(" ")[1]) - 1
                    if (index > topicmaps.length)
                       throw Error ("Could not load topicmap " + index + " with just " + topicmaps.length + " available")
                    selected_topic = undefined
                    graph_panel.set_description('')
                    // select, load and render new one
                    selected_topicmap = topicmaps[index]
                    load_selected_topicmap()

                } else if (user_input.startsWith("hide")) {

                    if (user_input.indexOf("assocs") != -1 ) graph_panel.hide_assocs()

                } else if (user_input.startsWith("show")) {

                    if (user_input.indexOf("assocs") != -1 ) graph_panel.show_assocs()

                } else if (user_input.startsWith("group")) {
                    // ### create associations of type X between all selected notes
                    for (var idx in multi_selection) {
                        if (multi_selection[idx].id !== "") {
                            console.log(" group > ", multi_selection[idx].id)
                        }
                    }

                } else if (user_input.startsWith("?")) {

                    var idx = user_input.split(" ")[1]
                    if (typeof idx === "undefined") idx = idx[0]
                    // depends on dm4-little-helpers module installed
                    controller.search_topics(idx.trim(), function (items) {
                        
                        search_results = items
                        console.log("> suggestions for " + idx +" are ", search_results)

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

})
