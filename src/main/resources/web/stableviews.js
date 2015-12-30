
// Load common code that includes config, then load the app logic for the stableviews main page.
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

        // retrieve ids from route /#1234/#567 (1. Topicmap, 2. Topic)
        var location = window.document.location
        var map_id = location.hash.substr(1)
        var topic_id = undefined
        if (location.hash.indexOf("/") !== -1) {
            map_id = location.hash.split("/")[0].substr(1)
            topic_id = location.hash.split("/")[1].substr(1)
        }

        // ..
        graph_panel.init()
        setup_map_panel_listeners()
        setup_page_listeners()

        // ..
        controller.loadUsername(function(xhr) {
            var user_screen = d3.select('.user-dialog')
            if (xhr.response=== "") {
                user_screen.text("Hello Visitor!")
            } else {
                user_screen.text("Hello " + xhr.response + "!")
            }
        })

        // 1) ...
        controller.loadAllTopicTypes(function(topicTypes) {
            console.log("Topic Types", topicTypes)
        })
        controller.loadAllAssocTypes(function(assocTypes) {
            console.log("Association Types", assocTypes)
        })

        // 2) ..
        controller.loadAllTopicmaps(function(response) {

            topicmaps = response
            console.log("Topicmaps", topicmaps)

            if (map_id) { // load routed map
                selected_topicmap = { id: map_id }
            } else { // load first map we get
                selected_topicmap = topicmaps[0]
            }
            // 2.1) ..
            controller.loadTopicmap(selected_topicmap.id, function(result) {
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
                    if (user_input.indexOf("files") !== -1 ) graph_panel.high_files()
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
                            search_results.push({
                                topic: selected_topicmap.topics[t],
                                workspace: {value: "", id: -1},
                                workspace_mode: ""
                            })
                        }
                    }
                    for (var e in selected_topicmap.assocs) {
                        var assoc_name = selected_topicmap.assocs[e].value.toLowerCase()
                        // var assoc_type = selected_topicmap.assocs[t].type_uri.toLowerCase()
                        if (assoc_name.indexOf(user_input) !== -1) {
                            // console.log("> assoc " + assoc_name)
                            search_results.push({
                                topic: selected_topicmap.assocs[e],
                                workspace: {value: "", id: -1},
                                workspace_mode: ""
                            })
                        }
                    }
                    if (common.debug) console.log("Text Input Suggestions", search_results)
                    /** controller.searchTopics(idx.trim(), function (items) {
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
            controller.searchTopics(value.trim(), function(items) {
                search_results = items // store latest search results globally
                render_search_results()
            }, null, false)
        }

        function set_document_title(message) {
            window.document.title = message + " - Stableviews 0.3 / DeepaMehta 4.7"
        }

        // -- Top Level Page Handlers

        function update_topicmap_url() {
            window.location.hash = "#" + selected_topicmap.info.id
        }

        function setup_page_listeners()  {
            // Search Button Handler
            d3.select("#search").on('click', function(e) {
                var input = d3.select("#textinput")[0][0]
                var value = input.value
                do_search(value)
            })
            // Map Viewport Reset Handler
            d3.select("#map-commands #zoom-in").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                graph_panel.zoom_in()
            })
            d3.select("#map-commands #zoom-out").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                graph_panel.zoom_out()
            })
            d3.select("#map-commands #reset").html(get_label("Reset"))
            d3.select("#map-commands #reset").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                graph_panel.reset_viewport()
            })
        }

        // -- Map Panel Listeners

        // These listeners get cleared out with map-panel when switching topicmap
        function setup_map_panel_listeners() {

            graph_panel.listen_to('selection', function(e) {
                // if (common.debug) console.log(" > selection ", e.detail)
                controller.loadTopic(e.detail.id, function(topic) {
                    // update client side model (as a param for commands)
                    selected_topic = topic
                    multi_selection = []
                    // ###
                    graph_panel.highlight_topic(selected_topic.id)
                    // render page title
                    graph_panel.set_title(topic.value)
                    graph_panel.set_page_type(
                            topic.type_uri.substr(topic.type_uri.lastIndexOf('.') + 1))
                    // render topic type commands
                    render_topic_commands()
                    // render details
                    if (selected_topic.type_uri === "dm4.notes.note") {
                        graph_panel.set_description(selected_topic.childs['dm4.notes.text'].value)
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

            graph_panel.listen_to('topicmap_zoomed', function(e) {
                // if (common.debug) console.log("Topicmap Zoomed", e.detail)
                // ### todo: show labels if zoom level >= than 1
            })

            graph_panel.listen_to('rendered_topicmap', function(e) {
                // calculate bounds (out of interest)
                var bounds = graph_panel.get_topicmap_bounds()
                var viewport = graph_panel.get_viewport_size()
                if (common.debug) console.log("Rendered Topicmap Bounds", bounds, "Viewport Bounds", viewport,
                    "Topicmap ID", selected_topicmap.info.id)
                // set window title
                set_document_title(selected_topicmap.info.value)
                // ### hide loader dummy
                d3.select(".loader").classed("hide", true)
                d3.select("#map-commands").attr("style", "display: block;")
            })

            graph_panel.listen_to('topicmap_transformed', function(e) {
                // if (common.debug) console.log("Topicmap Transformation", e.detail)
            })
        }

        // -- Topic Commands (on selected_topic)

        function render_topic_commands() {
            d3.selectAll(".toolbar ul li").remove()
            if (selected_topic.type_uri === "dm4.webbrowser.web_resource") {    // -- Web Resource Commands
                d3.select(".toolbar ul").append("li").append("a").attr("title", "Visit Website")
                    .attr("href", selected_topic.value).text("Open URL")
            } else if (selected_topic.type_uri === "dm4.files.file") {          // -- File Topic Commands
                var filepath = selected_topic.childs["dm4.files.path"].value
                var file_title = selected_topic.childs["dm4.files.media_type"].value
                    + ", Size: " + selected_topic.childs["dm4.files.size"].value / 1024 + " KByte"
                d3.select(".toolbar ul").append("li").append("a").attr("title", file_title)
                    .attr("href", "/filerepo/" + filepath).text("Get File")
            }
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
                    var reveal_link = item.append('a').attr('href',
                            "#" + selected_topicmap.info.id + '/#' + result.topic.id)
                        .attr('class', "reveal-item").attr("id", "show-" + result.topic.id)
                        .html('&ldquo;' + result.topic.value+'&rdquo;')
                    if (result.workspace.id > -1) { // search result is NOT part of this map
                        // hack action into element id
                        reveal_link.attr("id", "load-" + result.topic.id)
                        item.append('span').html(' &ndash; <b>' + get_label(result.topic.type_uri) + '</b>'
                            + ' in Workspace <em>' +result.workspace.value+ ' &ndash; '+result.workspace_mode+'</em>')
                    }
                    if (result.topic.type_uri === "dm4.topicmaps.topicmap") { // hack action into element id
                        reveal_link.attr("id", "tmap-" + result.topic.id) // search result is of type TOPICMAP
                    }
                    reveal_link.on('click', function() {
                        var selected_topic_id = d3.event.target.id.substr(5)
                        if (d3.event.target.id.startsWith("show-")) {
                            // select and show topic in map
                            graph_panel.focus_topic(selected_topic_id)
                        } else if (d3.event.target.id.startsWith("load-")) {
                            console.log("load and put topic", selected_topic_id)
                        } else if (d3.event.target.id.startsWith("tmap-")) {
                            if (selected_topic_id != selected_topicmap.id) {
                                console.log("open new topicmap...", selected_topic_id, selected_topicmap.id)
                                selected_topicmap.id = selected_topic_id
                                load_selected_topicmap()
                            } else {
                               console.log("skipping to open topicmap - already visible")
                            }
                        }
                    })
            }
            if (search_results.length === 0) d3.select('.search-results').attr("style", "display: none")
        }

        function load_selected_topicmap() {
            // prepare/cleanup
            graph_panel.clear()
            d3.select("#map-commands").attr("style", "display: none;")
            // load new topicmap
            controller.loadTopicmap(selected_topicmap.id, function(result) {
                selected_topicmap = result
                setup_map_panel_listeners() // ### fixme: there should be no need to re-attach these
                graph_panel.show_topicmap(selected_topicmap)
                // re-attach our listeners for events of the map panel module
                update_topicmap_url()
            })
        }

        return {}

    })

})
