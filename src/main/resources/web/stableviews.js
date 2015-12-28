
// Load common code that includes config, then load the app logic for this page.
require(['common'], function(common) {

    require(['graph_panel', 'stableviews_ctrl', 'labels_en'], function(graph_panel, controller, en) {

        // authenticated staff only stuff
        var username = undefined            //
        var workspaces = undefined          //

        // topic map and selection stuff
        var topicmaps = undefined           //
        var selected_topicmap = undefined   // with all its topics and assocs, currently also directly used for autocompletion
        var selected_topic = undefined      //
        var multi_selection = []            //

        // command line related stuff
        var search_results = []             // latest search results // ### expand this to set to just contain unique elements
        var topic_commands = []             // basic set of commands for a given topic
        var reverse_search = []             // list of recently executed commands (non-persistent)

        // 0) ..
        graph_panel.init()

        // ### Currently, all these listeners get cleared out with map-panel when switching topicmap

        graph_panel.listen_to('selection', function(e) {
            // if (common.debug) console.log(" > selection ", e.detail)
            controller.load_topic(e.detail.id, function(topic) {
                // update client side model (as a param for commands)
                selected_topic = topic
                multi_selection = []
                graph_panel.highlight_topic(selected_topic.id)
                // render
                graph_panel.set_title(topic.value)
                graph_panel.set_page_type(
                        topic.type_uri.substr(topic.type_uri.lastIndexOf('.') + 1))
                if (selected_topic.type_uri === "dm4.notes.note") {
                    graph_panel.set_description(selected_topic.childs['dm4.notes.text'].value)
                } else if (selected_topic.type_uri === "dm4.webbrowser.web_resource") {
                    console.log("Web Topic", selected_topic)
                } else if (selected_topic.type_uri === "dm4.files.file") {
                    console.log("File Topic", selected_topic)
                } else {
                    // d3.select('.container .text').transition().style('height', String("0%")).duration(1000)
                    // setTimeout(function(e) {
                    graph_panel.set_description('')
                    // }, 1000)
                }
            })
        })

        graph_panel.listen_to('multi_selection', function(e) {
            // update client side model (as a param for commands)
            multi_selection = e.detail
            if (common.debug) console.log("Multi Select", e.detail)
        })

        graph_panel.listen_to('rendered_topicmap', function(e) {
            var bounds = graph_panel.get_topicmap_bounds()
            var viewport = graph_panel.get_viewport_size()
            if (common.debug) console.log("Rendered Topicmap Bounds", bounds, "Viewport Bounds", viewport,
                "Topicmap ID", selected_topicmap.info.id)
        })

        graph_panel.listen_to('topicmap_transformed', function(e) {
            if (common.debug) console.log("Topicmap Transformation", e.detail)
        })

        // General Handlers
        d3.select("#search").on('click', function(e) {
            var input = d3.select("#textinput")[0][0]
            var value = input.value
            do_search(value)
        })

        // 0) ..
        controller.get_username(function(xhr) {
            var user_screen = d3.select('.user-dialog')
            if (xhr.response=== "") {
                user_screen.text("Hello Visitor!")
            } else {
                user_screen.text("Hello " + xhr.response + "!")
            }
        })

        // 1) ..
        controller.load_all_topicmaps(function(response) {

            topicmaps = response
            selected_topicmap = topicmaps[0]

            // 1.2) ..
            controller.load_topicmap(selected_topicmap.id, function(result) {
                //
                selected_topicmap = result
                graph_panel.show_topicmap(selected_topicmap)
            })

        })

        // --- Setup command line input area
        // --- ### setup gui for autocompletion
        // --- ### make this a web-component

        d3.select('#textinput').on('keypress', function() {

            if (d3.event.keyCode === 13 && d3.event.target.value.length > 2) {

                // 2) try to execute input as command

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
                    // clear command line
                    d3.event.target.value = ''

                } else if (user_input.startsWith("hide")) {

                    if (user_input.indexOf("assocs") !== -1 ) graph_panel.hide_assocs()
                    if (user_input.indexOf("hidden") !== -1 ) graph_panel.hide_topics_hidden()
                    // clear command line
                    d3.event.target.value = ''

                } else if (user_input.startsWith("show")) {

                    if (user_input.indexOf("assocs") !== -1 ) graph_panel.show_assocs()
                    if (user_input.indexOf("hidden") !== -1 ) graph_panel.show_topics_hidden()
                    if (user_input.indexOf("institution") !== -1 ) graph_panel.high_institutions()
                    if (user_input.indexOf("websites") !== -1 ) graph_panel.high_websites()
                    if (user_input.indexOf("persons") !== -1 ) graph_panel.high_persons()
                    if (user_input.indexOf("notes") !== -1 ) graph_panel.high_notes()
                    // clear command line
                    d3.event.target.value = ''

                } else if (user_input.startsWith("group")) {
                    // ### create associations of type X between all selected notes
                    for (var idx in multi_selection) {
                        if (multi_selection[idx].id !== "") {
                            console.log(" group > ", multi_selection[idx].id)
                        }
                    }

                } else {

                    do_search(user_input)

                }

            } else {

                // 1) use input as (topicmap wide) name search command

                // searching through names of elements visible in this map
                search_results = []
                if (d3.event.target.value.length >= 2) {
                    var user_input = d3.event.target.value.trim()
                    for (var t in selected_topicmap.topics) {
                        var topic_name = selected_topicmap.topics[t].value.toLowerCase()
                        // var topic_type = selected_topicmap.topics[t].type_uri.toLowerCase()
                        if (topic_name.indexOf(user_input) !== -1) {
                            // console.log("> add topic " + topic_name, topic_id, topic_type)
                            search_results.push({
                                topic: selected_topicmap.topics[t],
                                workspace: {value : "This map", id: -1},
                                workspace_mode: ""
                            })
                        }
                    }
                    for (var t in selected_topicmap.assocs) {
                        var assoc_name = selected_topicmap.assocs[t].value.toLowerCase()
                        // var assoc_type = selected_topicmap.assocs[t].type_uri.toLowerCase()
                        if (assoc_name.indexOf(user_input) !== -1) {
                            // console.log("> assoc " + assoc_name)
                            search_results.push({
                                topic: selected_topicmap.assocs[t],
                                workspace: {value : "This map", id: -1},
                                workspace_mode: ""
                            })
                        }
                    }
                    console.log("> suggestions", search_results)
                    /** controller.search_topics(idx.trim(), function (items) {
                        console.log("> append fulltext search results for " + idx +" are ", search_results)
                        search_results.push(items)
                        render_search_results()
                    }, null, false) **/
                }
                render_search_results()
            }

        })

        // --- Focus command line on startup
        document.getElementById('textinput').focus()

        // --- Search Command

        function do_search(value) {
            if (!value) throw new Error("Wont search for empty string")
            // depends on dm4-little-helpers module installed
            controller.search_topics(value.trim(), function(items) {
                search_results = items // store latest search results globally
                render_search_results()
            }, null, false)
        }

        // -- Login View

        function render_login_dialog() {

            /** function do_auth() {
                var element = d3.select('input.vp-id')[0][0]
                newCtrl.startSession(element.value, function (){
                    window.location.reload()
                }, common.debug)
            } **/
        }

        function render_search_results() {
            // show container
            d3.select('.search-results').attr("style", "display: block")
            // (re-) populate list
            d3.select('.search-result-list').selectAll('li').remove()
            var results_list = d3.select('.search-result-list')
            for (var idx in search_results) {
                var result = search_results[idx]
                var item = results_list.append('li')
                    item.append('a').attr('href', "#")
                        .html('<em>&ldquo;' + result.topic.value + '&rdquo;</em>')
                    item.append('span').html(' ' + get_label(result.topic.type_uri)
                        + ' in \"' +result.workspace.value+ '\" (<em>' +result.workspace_mode+ '</em>)')
            }
            if (search_results.length === 0) d3.select('.search-results').attr("style", "display: none")
        }

        function load_selected_topicmap() {
            controller.load_topicmap(selected_topicmap.id, function(result) {
                graph_panel.clear_panel()
                selected_topicmap = result
                graph_panel.show_topicmap(selected_topicmap)
            })
        }

        return {}

    })

})
