
// Load common code that includes config, then load the app logic for the stableviews main page.
require(['common'], function(common) {

    require(['graph_panel', 'stableviews_ctrl', 'label_dict_de'], function(graph_panel, controller, lang) {

        // --- Stableviews Client Side Model ---

        // authenticated staff only stuff
        var username = undefined            //
        var workspaces = undefined          //
        var jQueryAvailable = false
        try {
            jQueryAvailable = $;
        } catch (e) {}

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
        var SIDEBAR_COOKIE_NAME = "stableviews_sidebar"
        var DETAILS_COOKIE_NAME = "stableviews_detailwindow"
        var WORKSPACE_COOKIE_NAME = "dm4_workspace_id"

        // --- Initialization Map and Detail Panel ---

        graph_panel.init()
        setup_map_panel_listeners()
        setup_page_listeners()

        refresh_client_state()
        initiate_last_layout()

        function refresh_client_state(name) {
            // --- Loading of DM 4 Username ---
            refresh_user_status(name)
            // --- Loading DM 4 Type Definitions ---
            /** controller.loadAllTopicTypes(function(topicTypes) {
                console.log("Topic Types", topicTypes)
            })
            controller.loadAllAssocTypes(function(assocTypes) {
                console.log("Association Types", assocTypes)
            }) **/
            // --- Loading of DM 4 Topicmaps ---
            reload_topicmaps()
            // --- Loading of DM 4 Workspaces ---
            reloadWorkspaces()
        }

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
                        // var topic_type = selected_topicmap.topics[t].typeUri.toLowerCase()
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
                        // var assoc_type = selected_topicmap.assocs[t].typeUri.toLowerCase()
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

        function initiate_last_layout() {
            var sidebarState = get_cookie_value(SIDEBAR_COOKIE_NAME)
            if (sidebarState === null) { // no cookie set
                set_cookie_value(SIDEBAR_COOKIE_NAME, "false")
            } else if (sidebarState === "true") {
                d3.select('.main.sidebar').classed('visible', true)
            }
            var detailWindowState = get_cookie_value(DETAILS_COOKIE_NAME)
            if (detailWindowState === null) { // no cookie set
                set_cookie_value(DETAILS_COOKIE_NAME, "false")
            } else if (detailWindowState === "true") {
                d3.select(".lower.sidebar").classed('expanded', true)
            }
        }

        // ### document.getElementById('textinput').focus()

        // --- Search Dialog Functionality ---

        function do_search(value) {
            if (!value || value.length < 3) return // won't search for empty string
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
            window.document.title = message + " - Stableviews 0.4-SNAPSHOT / DeepaMehta 4.7"
        }

        function update_topicmap_url() {
            window.location.hash = "#" + selected_topicmap.topic.id
        }

        function setup_page_listeners() {
            // Authentication Form Handler
            d3.select("#authentication").on('submit', function() {
                var button = d3.select("#submit")[0][0]
                if (button.className.indexOf("logout") !== -1) {
                    controller.stopSession(function() {
                        refresh_client_state()
                    })
                } else {
                    var user = d3.select('#username')[0][0]
                    var pass = d3.select('#password')[0][0]
                    if (typeof user.value !== "undefined" && typeof pass.value !== "undefined"
                            || typeof user.value !== " " && typeof pass.value !== " "
                            || typeof user.value !== "" && typeof pass.value !== "") {
                        do_auth(user.value, pass.value)
                    }
                }
            })
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
            d3.select("#reset").html(lang.get_label("Reset"))
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
                    set_cookie_value(DETAILS_COOKIE_NAME, true)
                    d3.select(".lower.sidebar").classed('expanded', true)
                }
            })
            // Collapse Lower Sidebar
            d3.select("#map-panel").on('click', function() {
                // console.log("map panel clicked", d3.event.currentTarget, d3.event.target)
                if (!d3.event.target.nodeName.includes('rect') && !d3.event.target.nodeName.includes('line')) {
                    set_cookie_value(DETAILS_COOKIE_NAME, false)
                    d3.select(".lower.sidebar").classed('expanded', false)
                }
            })
            // Keep SVG Graph Panel in Sync with Document Size
            d3.select(window).on('resize', function() {
                if (graph_panel) graph_panel.resize()
            })
            // initiate "display options" menu
            if (jQueryAvailable) $('.ui.tertiary ').dropdown() // jQuery here, check for memex.html
            // initiate sidebar handler
            d3.select('#menu-button').on('click', function() {
                set_cookie_value(SIDEBAR_COOKIE_NAME, true)
                d3.select('.main.sidebar').classed('visible', true)
            })
            d3.select('#close-menu').on('click', function() {
                set_cookie_value(SIDEBAR_COOKIE_NAME, false)
                d3.select('.main.sidebar').classed('visible', false)
            })
            // Topicmap Selection Menu
            d3.select('.main.menu .ui.topicmaps').on('change', function() {
                selected_topicmap.id = d3.event.target.value // fixme: should use setters/getters
                console.log("Load Topicmap Selection", selected_topicmap.id)
                load_selected_topicmap()
            })
            // Workspace Selection Menu
            d3.select('.main.menu .ui.workspace-menu').on('change', function() {
                var newWorkspaceId = d3.event.target.value // fixme: should use setters/getters
                console.log("Selected Workspace", newWorkspaceId)
                set_cookie_value(WORKSPACE_COOKIE_NAME, newWorkspaceId)
            })
        }

        // --- Graph Panel Listeners ---

        // These listeners get cleared out with map-panel when switching topicmap
        function setup_map_panel_listeners() {

            graph_panel.listen_to('selection', function(e) {
                // if (common.debug) console.log(" > selection ", e.detail)
                multi_selection = []
                select_topic(e.detail.id)
                render_selection_commands()
            })

            graph_panel.listen_to('multi_selection', function(e) {
                // update client side model (as a param for commands)
                multi_selection = e.detail
                // console.log("Multi Select", e.detail)
                render_selection_commands()
            })

            graph_panel.listen_to('topicmap_zoomed', function(e) {
                // if (common.debug) console.log("Topicmap Zoomed", e.detail)
                // ### todo: show labels if zoom level >= than 1
            })

            graph_panel.listen_to('rendered_topicmap', function(e) {
                // calculate bounds (out of interest)
                // var bounds = graph_panel.get_topicmap_bounds()
                // var viewport = graph_panel.get_viewport_size()
                // clear search results
                search_results = []
                render_search_results()
                // set window title
                set_document_title(selected_topicmap.topic.value)
                set_page_title(selected_topicmap.topic.value)
                // ### hide loader dummy
                d3.select(".loader").classed("hide", true)
                d3.select("#map-commands").attr("style", "display: block;")
            })

            graph_panel.listen_to('topicmap_transformed', function(e) {
                // if (common.debug) console.log("Topicmap Transformation", e.detail)
            })

            graph_panel.listen_to('topic_translated', function(e) {
                if (username) { // persist topic moves if authenticated
                    if (multi_selection.length > 0) {
                        console.log("Move Selection", e.detail.id, "Diff X", e.detail.diff.x, " Diff Y", e.detail.diff.y)
                    } else {
                        console.log("Move Topic", e.detail.id, "Diff X", e.detail.diff.x, " Diff Y", e.detail.diff.y)
                        /* controller.updateTopicPosition(e.detail.topic, selected_topicmap.id, e.detail.diff, function(err) {
                            console.warn("Error while updating topic position", err, e.detail)
                        }) **/
                    }
                }
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
                set_page_class(topic.typeUri.substr(topic.typeUri.lastIndexOf('.') + 1))

                // render "Note" details
                if (selected_topic.typeUri === "dmx.notes.note") {
                    set_page_details(selected_topic.children['dmx.notes.text'].value)
                } else if (selected_topic.typeUri === "dmx.bookmarks.bookmark") {
                    if (selected_topic.children.hasOwnProperty('dmx.bookmarks.description')) {
                        set_page_details(selected_topic.children['dmx.bookmarks.description'].value)}
                    }
                else if (selected_topic.typeUri === "dmx.contacts.person" ||
                         selected_topic.typeUri === "dmx.contacts.organization") {
                    if (selected_topic.children.hasOwnProperty('dmx.contacts.person_description')) {
                        set_page_details(selected_topic.children['dmx.contacts.person_description'].value)
                    } else if (selected_topic.children.hasOwnProperty('dmx.contacts.organization_description')) {
                        set_page_details(selected_topic.children['dmx.contacts.organization_description'].value)
                    }
                } else {
                    set_page_details('')
                }
                render_topic_commands()
            })
        }


        // --- XYZ Renderer: Show Commands (of selected_topic) in Toolbar ---

        function render_selection_commands() {
            d3.selectAll(".selection-commands ul li").remove()
            if (multi_selection && username) {
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
        }

        function render_topic_commands() {

            d3.selectAll(".topic-commands ul li").remove()
            d3.select(".topic-commands").classed('hide', false)

            if (selected_topic.typeUri === "dmx.bookmarks.bookmark") {    // -- Web Resource Commands
                render_webbrowser_url_child(selected_topic)
            } else if (selected_topic.typeUri === "dmx.files.file") {          // -- File Topic Commands
                var filepath = selected_topic.children["dmx.files.path"].value
                var file_title = selected_topic.children["dmx.files.media_type"].value
                    + ", Size: " + selected_topic.children["dmx.files.size"].value / 1024 + " KByte"
                d3.select(".topic-commands ul").append("li").append("a").attr("title", file_title)
                    .attr("href", "/files/file/" + filepath + '?download').text("Access File")
            } else if (selected_topic.typeUri === "dmx.contacts.organization" ||
                       selected_topic.typeUri === "dmx.contacts.person") {     // --- Contact Topic Commands
                render_webbrowser_url_child(selected_topic)
            } else {
                d3.select(".topic-commands").classed('hide', true)
            }

        }

        function render_webbrowser_url_child(selected_topic) {
            // if a webbrowser.url value is set, append a "link" button into the toolbar
            if (selected_topic.children.hasOwnProperty('dmx.base.url')) {
                var url = selected_topic.children['dmx.base.url'].value
                if (url && url != "") {
                    d3.select(".topic-commands ul").append("li").append("a").attr("title", "Open URL " + url)
                        .attr("href", url).text("Open Webpage")
                }
            }
        }

        // ### use d3 data (binding) here
        function refresh_topicmap_menu() {
            var selectMenu = d3.select('#topicmap-selector')
            // clear menu entries
            d3.selectAll('#topicmap-selector option').remove()
            for (var t in topicmaps) {
                selectMenu.append('option').attr('value', topicmaps[t].id).text(topicmaps[t].value)
            }
            if (jQueryAvailable) $('#topicmap-selector').dropdown({ "fullTextSearch": true }) // jQuery check for memex.html
        }

        // ### use d3 data (binding) here
        function refresh_workspace_menu() {
            var workspaceMenu = d3.select('#workspace-selector')
            // clear menu entries
            d3.selectAll('#workspace-selector option').remove()
            for (var t in workspaces) {
                workspaceMenu.append('option').attr('value', workspaces[t].id).text(workspaces[t].value)
            }
            if (jQueryAvailable) $('#workspace-selector').dropdown({ "fullTextSearch": true }) // jQuery check for memex.html
        }

        // --- Authentication Dialog ---

        function refresh_user_status(name) {
            controller.loadUsername(function(response) {
                console.log("refresh_user_status", response)
                if (typeof response === "object") {
                    username = undefined
                } else if (response !== "") {
                    username = response
                    if (typeof username === "undefined") username = name
                }
                render_authentication_dialog()
            })
        }

        function render_authentication_dialog() {
            if (!username) { // Not authenticated
                d3.select('.username').text(username)
                d3.select(".login .userstatus").classed("hide", true)
                d3.select("#username").classed("hide", false)
                d3.select("#password").classed("hide", false)
                d3.select("#submit").classed("logout", false).text('Login')
            } else { // Authenticated
                d3.select('.username').text(username)
                d3.select(".login .userstatus").classed("hide", false)
                d3.select("#password").classed("hide", true)
                d3.select("#username").classed("hide", true)
                d3.select("#submit").classed("logout", true).text('Logout')
            }
        }

        function do_auth(user, pass) {
            controller.startSession(user, pass, function(e) {
                d3.select(".login-failure").text("")
                refresh_client_state(user)
            }, function() {
                    d3.select(".login-failure").html("Login incorrect.<br/><br/>Sorry, this username/password combination does not match.")
                    console.warn("Login Attempt FAILED")
                }, false)
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
                            "#" + selected_topicmap.topic.id + '/#' + result.topic.id)
                        .attr('class', "reveal-item").attr("id", "show-" + result.topic.id)
                        .html('&ldquo;' + result.topic.value+'&rdquo;')
                    if (result.workspace.id > -1) { // search result is NOT part of this map
                        reveal_link.attr("id", "load-" + result.topic.id)
                        item.append('span').html(' &ndash; <b>' + lang.get_label(result.topic.typeUri) + '</b>'
                            + ' in Workspace <em>' +result.workspace.value+ ' &ndash; '+result.workspace_mode+'</em>')
                    }
                    if (result.topic.typeUri === "dmx.topicmaps.topicmap") { // hack action into element id
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
                    set_page_title(selected_topicmap.topic.value)
                }
                d3.select('.search-results').classed("hide", true)
            } else {
                set_page_title('Search results')
                d3.select('.search-results').classed("hide", false)
            }
        }

        /** Code original authored by quirksmode (Source: http://www.quirksmode.org/js/cookies.html) */
        function get_cookie_value(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null
        }

        function set_cookie_value(name, value) {
            remove_cookie(name)
            document.cookie = name + "=" + value + "; "
        }

        function remove_cookie(key) {
            // Note: setting the expire date to yesterday removes the cookie
            var days = -1
            var expires = new Date()
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
            //
            document.cookie = key + "=;path=/;expires=" + expires.toGMTString()
        }

        // --- Stableviews Client Functionality ---

        function reloadWorkspaces() {
            controller.loadAllWorkspaces(function(response) {
                // ### check if workspace cookie still exist and do not override it
                if (response && response.length > 0) {
                    workspaces = response
                    var firstWs = workspaces[0]
                    console.log("Available Workspaces", response, "Set Workspace", firstWs.value)
                    set_cookie_value(WORKSPACE_COOKIE_NAME, firstWs.id)
                    refresh_workspace_menu()
                } else {
                    throw Error("Could not load workspaces")
                }
            })
        }

        function reload_topicmaps() {
            controller.loadAllTopicmaps(function(response) {
                topicmaps = response
                console.log("Available Topicmaps", topicmaps)
                refresh_topicmap_menu()
                if (map_id) { // load routed map
                    selected_topicmap = { topic : { id: map_id } }
                } else { // load first map we get
                    selected_topicmap = topicmaps[0]
                }
                load_selected_topicmap()
            })
        }

        function load_selected_topicmap() {
            if (!selected_topicmap) return
            if (!selected_topicmap.hasOwnProperty("id")) {
                // fixme: a selected_topicmap should always be the same type of object
                console.warn("Correcting Selected Topicmap ID", selected_topicmap.topic)
                selected_topicmap = selected_topicmap.topic
            }
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
