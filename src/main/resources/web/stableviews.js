
// Load common code that includes config, then load the app logic for the stableviews main page.
require(['common'], function(common) {

    require(['graph_panel', 'stableviews_ctrl', 'labels_en'], function(graph_panel, controller, en) {

        // --- Stableviews Client Side Model ---

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



        // --- Routing ---

        // retrieve ids from route /#1234/#567 (1. Topicmap, 2. Topic)
        var location = window.document.location
        var map_id = location.hash.substr(1)
        var topic_id = undefined
        if (location.hash.indexOf("/") !== -1) {
            map_id = location.hash.split("/")[0].substr(1)
            topic_id = location.hash.split("/")[1].substr(1)
        }

        // --- ### Cookie Visualization / Layout Settings

        var show_hidden_topics  = false
        var show_associations   = true
        var show_labels         = true

        // --- Initialization Map and Detail Panel ---

        graph_panel.init()
        setup_map_panel_listeners()
        setup_page_listeners()

        // --- Authentication ---

        controller.loadUsername(function(xhr) {
            var user_screen = d3.select('.user-dialog')
            if (xhr.response=== "") {
                user_screen.text("Hello Visitor!")
            } else {
                user_screen.text("Hello " + xhr.response + "!")
            }
        })

        // --- Loading DM 4 Type Definitions ---

        controller.loadAllTopicTypes(function(topicTypes) {
            console.log("Topic Types", topicTypes)
        })
        controller.loadAllAssocTypes(function(assocTypes) {
            console.log("Association Types", assocTypes)
        })

        // --- Loading of DM 4 Topicmaps ---

        // --- ### Introduce menu to allow for pointer-based selection of/switching among these

        controller.loadAllTopicmaps(function(response) {

            topicmaps = response
            console.log("Topicmaps", topicmaps)
            render_topicmap_menu()

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

        //

        // --- Setup command line input area ---

        // --- ### setup gui for autocompletion
        // --- ### make this a web-component

        d3.select('#search').on('keypress', function() {

            if (d3.event.keyCode === 13 && d3.event.target.value.length > 2) {

                // --- Fixme: Enter => Execute Command

                // 2) try to execute input as command
                var user_input = d3.event.target.value.trim()
                if (user_input.startsWith("open")) {            // --- Open/Load Topicmap Command
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

                } else if (user_input.startsWith("hide")) {     // --- Hide Elements of Graph Panel

                    if (user_input.indexOf("assocs") !== -1 ) graph_panel.hide_assocs()
                    if (user_input.indexOf("hidden") !== -1 ) graph_panel.hide_topics_hidden()
                    // clear command line
                    d3.event.target.value = ''

                } else if (user_input.startsWith("show")) {     // --- Show Elements of Graph Panel

                    if (user_input.indexOf("assocs") !== -1 ) graph_panel.show_assocs()
                    if (user_input.indexOf("hidden") !== -1 ) graph_panel.show_topics_hidden()
                    if (user_input.indexOf("institution") !== -1 ) graph_panel.high_institutions()
                    if (user_input.indexOf("websites") !== -1 ) graph_panel.high_websites()
                    if (user_input.indexOf("files") !== -1 ) graph_panel.high_files()
                    if (user_input.indexOf("persons") !== -1 ) graph_panel.high_persons()
                    if (user_input.indexOf("notes") !== -1 ) graph_panel.high_notes()
                    // clear command line
                    d3.event.target.value = ''

                } else if (user_input.startsWith("group")) {    // --- ### Group Selected Graph Panel Elements

                    // ### create associations of type X between all selected notes
                    for (var idx in multi_selection) {
                        if (multi_selection[idx].id !== "") {
                            console.log(" group > ", multi_selection[idx].id)
                        }
                    }

                } else {

                    do_search(user_input)                       // --- Do a fulltext search in the DM4 Database

                }

            } else {    // --- Render search result --- Note: The following code block certainly does not belong here!

                // --- Fixme: NOT Enter => Saerch for Topic in Topicmap, ### Database or for a ### Command

                // If the key is NOT Enter and the current Text Value entered is NOT longer than 2 Chars ....

                // 0) Fixme: Clear any existing search results ...
                search_results = []
                // 1) Fixme: Do search in all names of elements visible in this topicmap
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
                            search_results.push({
                                topic: selected_topicmap.assocs[e],
                                workspace: {value: "", id: -1},
                                workspace_mode: ""
                            })
                        }
                    }
                    // if (common.debug) console.log("Text Input Suggestions", search_results)
                    /** controller.searchTopics(idx.trim(), function (items) {
                        console.log("> append fulltext search results for " + idx +" are ", search_results)
                        search_results.push(items)
                        render_search_results()
                    }, null, false) **/
                }
                // 2) Fixme: Render elements in search results which are anway part of the curerntly rendered map
                render_search_results()
            }

        })

        // --- Put focus on command line element on startup ---

        // ### document.getElementById('textinput').focus()

        // --- Search Dialog Functionality ---

        function do_search(value) {
            if (!value) throw new Error("Wont search for empty string")
            // depends on dm4-little-helpers module installed
            controller.searchTopics(value.trim(), function(items) {
                search_results = items // store latest search results globally
                render_search_results()
            }, null, false)
        }

        function toggle_hidden_topics() {
            if (show_hidden_topics) {
                graph_panel.hide_topics_hidden()
                show_hidden_topics = false
            } else {
                graph_panel.show_topics_hidden()
                show_hidden_topics = true
            }
        }

        function set_page_title(title) {
            // d3.select('title').text(title)
            // d3.select('.container .text').transition().style('height', String("100%")).duration(1000)
            d3.select('.title').text(title)
        }

        function set_page_details(text) {
            if (text === "") {
                d3.select('.details').classed('show', false)
                return
            }
            d3.select('.details').classed('show', true).html(text)
        }

        function set_page_class(type) {
            d3.select('.container').attr('class', 'container ' + type)
        }

        function toggle_associations() {
            if (show_associations) {
                graph_panel.hide_assocs()
                show_associations = false
            } else {
                graph_panel.show_assocs()
                show_associations = true
            }
        }

         function toggle_labels() {
            if (show_labels) {
                graph_panel.hide_node_labels()
                show_labels = false
            } else {
                graph_panel.show_node_labels()
                show_labels = true
            }
        }

        // --- Top Level Page Handlers / Utilities ---

        function set_document_title(message) {
            window.document.title = message + " - Stableviews 0.3 / DeepaMehta 4.7"
        }

        function update_topicmap_url() {
            window.location.hash = "#" + selected_topicmap.info.id
        }

        function setup_page_listeners() {
            // Search Button Handler
            d3.select("#search").on('click', function(e) {
                var input = d3.select("#search")[0][0]
                console.log("Clicked Search", d3.event)
                var value = input.value
                do_search(value)
            })
            // Map Viewport Reset Handler
            d3.select("#zoom-in").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                graph_panel.zoom_in()
            })
            d3.select("#zoom-out").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                graph_panel.zoom_out()
            })
            d3.select("#reset").html(get_label("Reset"))
            d3.select("#reset").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                graph_panel.reset_viewport()
            })
            d3.select("#toggle-topics").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                toggle_hidden_topics()
            })
            d3.select("#toggle-assocs").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                toggle_associations()
            })
            d3.select("#toggle-labels").on('click', function(e) {
                d3.event.preventDefault()
                d3.event.stopPropagation()
                toggle_labels()
            })
            // Expand Lower Sidebar
            d3.select(".lower.sidebar").on('click', function(e) {
                // console.log("filterbar clicked", d3.event.currentTarget, d3.event.target)
                if (d3.event.currentTarget.className.includes("lower") &&
                    !d3.event.target.nodeName.toLowerCase().includes("input") &&
                    !d3.event.target.nodeName.toLowerCase().includes("a")) {
                    d3.select(".lower.sidebar").classed('expanded', true)
                }
            })
            // Collapse Lower Sidebar
            d3.select("#map-panel").on('click', function() {
                // console.log("map panel clicked", d3.event.currentTarget, d3.event.target)
                if (!d3.event.target.nodeName.includes('rect') && !d3.event.target.nodeName.includes('line')) {
                    d3.select(".lower.sidebar").classed('expanded', false)
                }
            })
            // Keep SVG Graph Panel in Sync with Document Size
            d3.select(window).on('resize', function() {
                if (graph_panel) graph_panel.resize()
            })
            // initiate "display options" menu // our only jQuery dependency
            $('.ui.tertiary ').dropdown()
            // initiate sidebar handler // no need for jQuery here
            var $menubtn = $('#menu-button')
                $menubtn.click(function(e) {
                    $('.main.sidebar').addClass('visible')
                    if ($('.main.sidebar').hasClass('visible')) {
                        console.log("Sidebar is Visible")
                    } else {
                        console.log("Sidebar is NOT Visible")
                    }
                })
            $('#close-menu').click(function(e) {
                $('.main.sidebar').removeClass('visible')
            })
            // Topicmap Selection Menu
            d3.select('.main.menu .ui.topicmaps.dropdown').on('change', function() {
                selected_topicmap.id = d3.event.target.value // fixme: should use setters/getters
                console.log("Load Topicmap Selection", selected_topicmap.id)
                load_selected_topicmap()
            })
        }

        // --- Graph Panel Listeners ---

        // These listeners get cleared out with map-panel when switching topicmap
        function setup_map_panel_listeners() {

            graph_panel.listen_to('selection', function(e) {
                // if (common.debug) console.log(" > selection ", e.detail)
                select_topic(e.detail.id)
            })

            graph_panel.listen_to('multi_selection', function(e) {
                // update client side model (as a param for commands)
                multi_selection = e.detail
                if (common.debug) console.log("Multi Select", e.detail)
                render_selection_commands()
            })

            graph_panel.listen_to('topicmap_zoomed', function(e) {
                // if (common.debug) console.log("Topicmap Zoomed", e.detail)
                // ### todo: show labels if zoom level >= than 1
            })

            graph_panel.listen_to('rendered_topicmap', function(e) {
                // calculate bounds (out of interest)
                var bounds = graph_panel.get_topicmap_bounds()
                var viewport = graph_panel.get_viewport_size()
                if (common.debug) {
                    console.log("Rendered Topicmap Bounds", bounds, "Viewport Bounds", viewport,
                        "Topicmap ID", selected_topicmap.info.id)
                }
                // clear search results
                search_results = []
                render_search_results()
                // set window title
                set_document_title(selected_topicmap.info.value)
                set_page_title(selected_topicmap.info.value)
                // ### hide loader dummy
                d3.select(".loader").classed("hide", true)
                d3.select("#map-commands").attr("style", "display: block;")
            })

            graph_panel.listen_to('topicmap_transformed', function(e) {
                // if (common.debug) console.log("Topicmap Transformation", e.detail)
            })
        }

        // --- Graph Panel Handlers: Selection ---

        function select_topic(id) {
            // load fresh topic from server side and then show it
            controller.loadTopic(id, function(topic) {
                // update client side model (as a param for commands)
                selected_topic = topic
                multi_selection = []
                // ###
                graph_panel.highlight_topic(selected_topic.id)
                // render page title
                set_page_title(topic.value)
                set_page_class(topic.type_uri.substr(topic.type_uri.lastIndexOf('.') + 1))
                // render topic type commands
                render_topic_commands()

                // render "Note" details
                if (selected_topic.type_uri === "dm4.notes.note") {
                    set_page_details(selected_topic.childs['dm4.notes.text'].value)
                } else if (selected_topic.type_uri === "dm4.webbrowser.web_resource") {
                    if (selected_topic.childs.hasOwnProperty('dm4.webbrowser.web_resource_description')) {
                        set_page_details(selected_topic.childs['dm4.webbrowser.web_resource_description'].value)}
                    }
                else if (selected_topic.type_uri === "dm4.contacts.person" ||
                         selected_topic.type_uri === "dm4.contacts.institution") {
                    if (selected_topic.childs.hasOwnProperty('dm4.contacts.notes')) {
                        set_page_details(selected_topic.childs['dm4.contacts.notes'].value)
                    }
                } else {
                    set_page_details('')
                }
            })
        }


        // --- XYZ Renderer: Show Commands (of selected_topic) in Toolbar ---

        function render_selection_commands() {
            d3.selectAll(".selection-commands ul li").remove()
            d3.select(".selection-commands").classed('hide', false)
            d3.select(".selection-commands ul").append("li").append("a")
                    .attr("title", "Associate selection").text('A').on('click', function() {
                        console.log("Associate current items in selection..", multi_selection)
                    })
            d3.select(".selection-commands ul").append("li").append("a")
                    .attr("title", "Hide selection").text('H').on('click', function() {
                        console.log("Hide current items in selection..", multi_selection)
                    })
        }

        function render_topic_commands() {

            d3.selectAll(".topic-commands ul li").remove()
            d3.select(".topic-commands").classed('hide', false)

            if (selected_topic.type_uri === "dm4.webbrowser.web_resource") {    // -- Web Resource Commands
                render_webbrowser_url_child(selected_topic)
            } else if (selected_topic.type_uri === "dm4.files.file") {          // -- File Topic Commands
                var filepath = selected_topic.childs["dm4.files.path"].value
                var file_title = selected_topic.childs["dm4.files.media_type"].value
                    + ", Size: " + selected_topic.childs["dm4.files.size"].value / 1024 + " KByte"
                d3.select(".topic-commands ul").append("li").append("a").attr("title", file_title)
                    .attr("href", "/filerepo/" + filepath).text("Access File")
            } else if (selected_topic.type_uri === "dm4.contacts.institution" ||
                       selected_topic.type_uri === "dm4.contacts.person") {     // --- Contact Topic Commands
                render_webbrowser_url_child(selected_topic)
            } else {
                d3.select(".topic-commands").classed('hide', true)
            }

        }

        function render_webbrowser_url_child(selected_topic) {
            // if a webbrowser.url value is set, append a "link" button into the toolbar
            if (selected_topic.childs.hasOwnProperty('dm4.webbrowser.url')) {
                var url = selected_topic.childs['dm4.webbrowser.url'].value
                if (url && url != "") {
                    d3.select(".toolbar ul").append("li").append("a").attr("title", "Open URL " + url)
                        .attr("href", url).text("Open Webpage")
                }
            }
        }

        // ### use d3 data (binding) here
        function render_topicmap_menu() {
            //
            var selectMenu = d3.select('.ui.topicmaps.dropdown')
            // var items = []
            console.log("Topicmap Selection Menu", selectMenu)
            for (var t in topicmaps) {
                // items.push({ "name" : topicmaps[t].value, "value": topicmaps[t].id })
                selectMenu.append('option').attr('value', topicmaps[t].id).text(topicmaps[t].value)
            }
            $('.ui.main.menu .ui.topicmaps').dropdown({
                "fullTextSearch": true
            })
            /**
                apiSettings: {
                    url: '/core/topic/by_type/dm4.topicmaps.topicmap?include_childs=true'
                }, onResponse: function(response) {
                    console.log("Topicmap Selection API Response", response)
                    var items = []
                    for (var t in topicmaps) {
                        items.push({ "name" : topicmaps[t].value, "value": topicmaps[t].id })
                    }
                    return {
                        "success": true,
                        "results": items
                    }
                }
            }) **/
        }

        // --- TODO: Login View ---

        function render_login_dialog() {

            /** function do_auth() {
                var element = d3.select('input.vp-id')[0][0]
                newCtrl.startSession(element.value, function (){
                    window.location.reload()
                }, common.debug)
            } **/
        }

        // --- Search Result Renderer: Show latest search results (or suggestions?) ---

        function render_search_results() {
            // show container
            d3.select('.search-results').attr("style", "display: block")
            // (re-) populate list
            d3.select('.search-result-list').selectAll('li').remove()
            var results_list = d3.select('.search-result-list')
            for (var idx in search_results) {
                var result = search_results[idx]
                var item = results_list.append('li')
                    // ### we hack an internal action command into the search results element id
                    var reveal_link = item.append('a').attr('href',
                            "#" + selected_topicmap.info.id + '/#' + result.topic.id)
                        .attr('class', "reveal-item").attr("id", "show-" + result.topic.id)
                        .html('&ldquo;' + result.topic.value+'&rdquo;')
                    if (result.workspace.id > -1) { // search result is NOT part of this map
                        reveal_link.attr("id", "load-" + result.topic.id)
                        item.append('span').html(' &ndash; <b>' + get_label(result.topic.type_uri) + '</b>'
                            + ' in Workspace <em>' +result.workspace.value+ ' &ndash; '+result.workspace_mode+'</em>')
                    }
                    if (result.topic.type_uri === "dm4.topicmaps.topicmap") { // hack action into element id
                        reveal_link.attr("id", "tmap-" + result.topic.id) // search result is of type TOPICMAP
                    }
                    reveal_link.on('click', function() {
                        var new_topic_id = d3.event.target.id.substr(5)
                        if (d3.event.target.id.startsWith("show-")) { // is result from current map
                            // select topic on page (### todo: no need to load it)
                            select_topic(new_topic_id)
                            // focus topic on graph panel
                            graph_panel.focus_topic(new_topic_id)
                        } else if (d3.event.target.id.startsWith("load-")) {
                            // ### todo: implement check if topic is part of currnt topicmap
                            // ### todo: load topic and place it in current map
                            // see/re-use? topicmap_renderer add_topic_to_topicmap()
                            // console.log("load and put topic", new_topic_id)
                        } else if (d3.event.target.id.startsWith("tmap-")) {
                            // ### "selected_topic_id" maybe undefined
                            if (selected_topic_id != selected_topicmap.id) {
                                console.log("open new topicmap...", new_topic_id, selected_topicmap.id)
                                selected_topicmap.id = new_topic_id
                                load_selected_topicmap()
                            } else {
                               console.log("skipping to open topicmap - already visible")
                            }
                        }
                    })
            }
            // show/hide search results area
            if (search_results.length === 0) {
                if (selected_topic) { // ## may not be set, selected_topicmap could be set here then
                    set_page_title(selected_topic.value)
                } else {
                    set_page_title(selected_topicmap.info.value)
                }
                d3.select('.search-results').classed("hide", true)
            } else {
                set_page_title('Search results')
                d3.select('.search-results').classed("hide", false)
            }
        }

        // --- Stableviews Client Functionality ---

        function load_selected_topicmap() {
            // prepare/cleanup
            graph_panel.clear()
            d3.select(".loader").classed("hide", false)
            d3.select("#map-commands").attr("style", "display: none;")
            // load new topicmap
            controller.loadTopicmap(selected_topicmap.id, function(result) {
                selected_topicmap = result
                console.log("Loaded Topicmap", selected_topicmap)
                setup_map_panel_listeners() // ### fixme: there should be no need to re-attach these
                graph_panel.show_topicmap(selected_topicmap)
                // re-attach our listeners for events of the map panel module
                update_topicmap_url()
            })
        }

        return {}

    })

})
