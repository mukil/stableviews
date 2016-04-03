
define(function(require) {

    require('stableviews_ctrl')
    require('common')
    require('label_dict')

    var view_state      = ""
    var svg_panel       = undefined

    var width           = window.innerWidth, // - (window.innerWidth / 10),
        height          = window.innerHeight - parseInt(d3.select('.lower.sidebar').style('height')),
        shiftKey, ctrlKey

    var map_topic, all_nodes, all_edges = undefined

    var node_offset_x   = 20
    var node_offset_y   = 10
    //
    var text_offset_x   = 40
    var text_offset_y   = 15
    //
    var node_circle_w   = 50
    var node_edge_r     = 25
    var node_link_y_off = 12

    var zoom_control    = undefined
    var zoom_out_stop   = 0.1
    var zoom_in_stop    = 1.8

    var svg_graph, vis, link, node = undefined

    var xScale = d3.scale.linear().domain([0,width]).range([0,width])
    var yScale = d3.scale.linear().domain([0,height]).range([0, height])

    // ------ Initialization of page (according to view_state)

    function init_panel() {

        svg_panel = d3.select("#map-panel")
            .on("keydown", key_down)
            .on("keyup", key_up)
            .each(function() { this.focus() })
            .append("svg")
                .attr("width", width)
                .attr("height", height)

        // ### enable moving of selected topics via arrow-keys
        function key_down() {
            shiftKey = d3.event.shiftKey || d3.event.metaKey
            ctrlKey = d3.event.ctrlKey
            if (shiftKey) {
                // ### 
            }
        }

        function key_up() {
            shiftKey = d3.event.shiftKey || d3.event.metaKey
            ctrlKey = d3.event.ctrlKey
        }
    }

    function resize_viewport() {
        var width           = window.innerWidth, // - (window.innerWidth / 10),
            height          = window.innerHeight - parseInt(d3.select('.lower.sidebar').style('height'))
        if (svg_panel) svg_panel.attr('width', width).attr('height', height)
    }

    function render_network() {
        // setup elements
        svg_panel.attr("id", "topicmap-" + map_topic.info.id)
        svg_graph = svg_panel.append('svg:g')
        vis = svg_graph.append("svg:g").attr('id', 'vis').attr('opacity', 1)

        // prepare association view-model (get coordinates from topics)
        all_edges.forEach(function(d) {
            d.source = get_topic_by_id(d.role_1.topic_id)
            d.target = get_topic_by_id(d.role_2.topic_id)
        })
    
        link_group = vis.append("g").attr("class", "links")
        link_sel = link_group.selectAll("line").data(all_edges)
        link_sel.enter().append("line")
                .attr("id", function(d) { return d.id })
                .attr("data-type-uri", function(d) { return d.type_uri })
                .attr("x1", function(d) { return d.source.view_props['dm4.topicmaps.x'] })
                .attr("y1", function(d) { return d.source.view_props['dm4.topicmaps.y'] + node_link_y_off })
                .attr("x2", function(d) { return d.target.view_props['dm4.topicmaps.x'] })
                .attr("y2", function(d) { return d.target.view_props['dm4.topicmaps.y'] + node_link_y_off })
        link_sel.exit().remove()

        node_group = vis.append("g").attr("class", "topics")
        node_sel = node_group.selectAll("rect").data(all_nodes)
        // node_sel.attr() // update to operate on old elements
            // .append("g").attr("class", "topic")
        node_sel.enter()
            .append("rect") // operations for new elements
                .attr("id", function(d) { return d.id })
                .attr("title", function(d) { return get_label(d.type_uri) + ": " + d.value})
                .attr("alt", function(d) { return "A circle representing " + d.value})
                .attr("data-view-prop-visibility", function(d) { return d.view_props['dm4.topicmaps.visibility'] })
                .attr("data-type-uri", function(d) { return d.type_uri })
                .attr("data-type-label", function(d) { return d.value })
                // ### make unique .attr("tabindex", 100)
                .attr("width", node_circle_w).attr("height", node_circle_w)
                .attr("rx", node_edge_r).attr("ry", node_edge_r)
                .attr("x", function(d) { return parseInt(d.view_props['dm4.topicmaps.x']) - node_offset_x })
                .attr("y", function(d) { return parseInt(d.view_props['dm4.topicmaps.y']) - node_offset_y })
                .on("dblclick", function(d) {
                    // ### sourceEvent may be undefined
                    d3.event.sourceEvent.stopPropagation()
                })
                .on("click", function(d) {
                    if (!shiftKey) {
                        //if the shift key isn't down, unselect everything
                        node_sel.classed("selected", function(p) {
                            return p.selected =  p.previouslySelected = false
                        })
                    }
                    // fire about selection
                    var selection = node_sel.filter(function(d) { return d.selected })
                    if (selection[0].length >= 2) {
                        fire_multi_selection(selection[0])
                    } else {
                        fire_item_selection(d)
                    }
                    // ### if not part of multi-selection, always select this node
                    d3.select(this).classed("selected", d.selected = !d.previouslySelected)
                })
                .on("mouseup", function(d) {
                    //if (d.selected && shiftKey) d3.select(this).classed("selected", d.selected = false);
                })
                .call(d3.behavior.drag()
                    .origin(function(d) { return d })
                    .on("dragstart", drag_node_start)
                    .on("drag", drag_node))
        // ### operations for old and new elements
        node_sel.exit().remove()  // operations for deleted elements

        // for alternative text rendering approaches see
        // foreignObject: https://gist.github.com/mbostock/1424037
        // wrappingLongLabels: http://bl.ocks.org/mbostock/7555321
        // wordWrapFunction: http://stackoverflow.com/questions/12677878/change-svg-text-to-css-word-wrapping
        // w. text-breakup: https://www.w3.org/Graphics/SVG/Test/20110816/svg/text-text-03-b.svg
        text_group = vis.append("g").attr("class", "labels")
        text_sel = text_group.selectAll("textArea").data(all_nodes)
        text_sel.enter()
            .append("text")
                .attr("id", function(d) { return 'label-' + d.id })
                .attr("title", function (d) { return d.value })
                .attr("x", function(d) { return parseInt(d.view_props['dm4.topicmaps.x']) - text_offset_x })
                .attr("y", function(d) { return parseInt(d.view_props['dm4.topicmaps.y']) - text_offset_y })
                .attr("class", function(d) { return (d.view_props['dm4.topicmaps.visibility']) ? '' : 'hide' })
                .text(function (d) { return d.value })
        text_sel.exit().remove()
        setup_zoom_and_drag_control()

        // get and set initial topicmap translation
        var translation = map_topic.info.childs["dm4.topicmaps.state"].childs["dm4.topicmaps.translation"]
        var translationX = parseInt(translation.childs["dm4.topicmaps.translation_x"].value)
        var translationY = parseInt(translation.childs["dm4.topicmaps.translation_y"].value)
        graph_translation_keep_zoom([translationX, translationY])

        function drag_node_start(d) {
            d3.event.sourceEvent.stopPropagation() // ###
            if (!d.selected && !shiftKey) {
                // if this node isn't selected, then we have to unselect every other node
                node_sel.classed("selected", function(p) { return p.selected =  p.previouslySelected = false })
            }
            d3.select(this).classed("selected", function(p) { 
                d.previouslySelected = d.selected
                return d.selected = true 
            })
        }
 
        function drag_node(d) {
            move(d3.event.dx, d3.event.dy)
        }

        function move(dx, dy) { // ### maybe adapt to new selection mechanics
            // label data join
            text_sel.filter(function(d) { return d.selected })
                .attr("x", function(d) { return parseInt(d.view_props['dm4.topicmaps.x']) - text_offset_x })
                .attr("y", function(d) { return parseInt(d.view_props['dm4.topicmaps.y']) - text_offset_y })
            // topics data join
            node_sel.filter(function(d) { return d.selected })
                .attr("x", function(d) {
                    var new_val = parseInt(d.view_props['dm4.topicmaps.x']) + dx
                    d.view_props['dm4.topicmaps.x'] = new_val
                    return new_val - node_offset_x
                })
                .attr("y", function(d) {
                    var new_val = parseInt(d.view_props['dm4.topicmaps.y']) + dy
                    d.view_props['dm4.topicmaps.y'] = new_val
                    return new_val - node_offset_y
                })
            // association data join
            link_sel.filter(function(d) { return d.source.selected })
                .attr("x1", function(d) { return d.source.view_props['dm4.topicmaps.x'] })
                .attr("y1", function(d) { return d.source.view_props['dm4.topicmaps.y'] + node_link_y_off })
            link_sel.filter(function(d) { return d.target.selected })
                .attr("x2", function(d) { return d.target.view_props['dm4.topicmaps.x'] })
                .attr("y2", function(d) { return d.target.view_props['dm4.topicmaps.y'] + node_link_y_off })
        }

    }

    function show_topicmap(topicmap) {
        if (!svg_panel) {
            init_panel()
        }
        if (topicmap) {
            if (topicmap.topics) {
                map_topic = topicmap
                all_nodes = topicmap.topics
                all_edges = topicmap.assocs
                // ### view_state = "topicmap_show"
            } else {
                throw Error ("Could not load topicmap for ID ", topicmap)
            }
        }
        render_network()
        hide_hidden_topics()
        fire_rendered_topicmap()
    }

    function clear_map_panel() {
        if (svg_panel) {
            svg_panel = undefined
            d3.select('#map-panel svg').remove() // ## fix: should not clear our text-area
        }
    }

    // --- Event Handling Methods

    function listen_to(event_name, handler) {
        if (!svg_panel) init_panel()
        svg_panel.node().addEventListener(event_name, handler)
    }

    function fire_item_selection(item) {
        svg_panel.node().dispatchEvent(new CustomEvent('selection', { detail: item }))
    }

    function fire_multi_selection(items) {
        svg_panel.node().dispatchEvent(new CustomEvent('multi_selection', { detail: items }))
    }

    function fire_rendered_topicmap() {
        svg_panel.node().dispatchEvent(new CustomEvent('rendered_topicmap', { detail: map_topic }))
    }

    function fire_map_transformation(value) {
        svg_panel.node().dispatchEvent(new CustomEvent('topicmap_transformed', { detail: value }))
    }

    function fire_map_zoom(value) {
        svg_panel.node().dispatchEvent(new CustomEvent('topicmap_zoomed', { detail: value }))
    }

    // --- Graph Renderer Helper Methods

    function get_topic_by_id(topicId) {
        for (var idx in all_nodes) {
            if (topicId == all_nodes[idx].id) {
                return all_nodes[idx]
            }
        }
    }

    function setup_zoom_and_drag_control() {
        zoom_control = d3.behavior.zoom()
            .scaleExtent([zoom_out_stop, zoom_in_stop])
            .x(xScale).y(yScale)
            .on("zoom", zoom_and_pan)
            .on("zoomend", zoom_and_pan_end)
        svg_panel.call(zoom_control)

        function zoom_and_pan() {
            vis.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")")
        }
        function zoom_and_pan_end() {
            fire_map_transformation(vis.attr("transform"))
        }
    }

    // --- Visualization Adjustment Methods

    function focus_topic_by_id(id) {
        var topic = get_topic_by_id(id)
        if (topic) {
            var viewport = get_viewport_size()
            var x = topic.view_props['dm4.topicmaps.x'],
                y = topic.view_props['dm4.topicmaps.y']
            if (x < 0 || x >= viewport.width || y < 0 || y >= viewport.height) {
                var dx = (viewport.width / 2 - x)
                var dy = (viewport.height / 2 - y)
                graph_translation_keep_zoom([dx, dy])
            }
            // set graph element css class to "selected
            set_node_selected(id)
        } else {
            throw new Error("Could not find topic with id "+id+" in Topicmap", all_nodes)
        }
    }

    function graph_translation_keep_zoom(coordinatePair) {
        if (!coordinatePair[0] || !coordinatePair[1]) {
            console.warn("Coordinate Pair for Map Translation is Invalud", coordinatePair)
            // would break our zoom_control behaviour if passed through
        } else {
            vis.attr("transform", "translate(" + coordinatePair + ") scale(" + zoom_control.scale() + ")")
            // set d3 zoom control
            zoom_control.translate(coordinatePair)
        }
    }

    function set_node_selected(topic_id) {
        // unselect every other node
        node_sel.classed("selected", function(p) {
            return p.selected =  p.previouslySelected = false
        })
        // highlight node with topic id
        var selection = node_sel.filter(function(d) {
            if (d.id == topic_id) return d
        })
        if (selection) {
            selection.classed("selected", true)
        }
    }

    function get_topicmap_bounds() {
        return svg_graph.node().getBBox()
    }

    function get_viewport_size() {
        var map_panel = d3.select('#map-panel')
        return { "width": parseFloat(map_panel.style("width")), "height": parseFloat(map_panel.style("height")) }
    }

    function zoom_in() {
        var value = zoom_control.scale() + 0.2
        if (value < zoom_in_stop) {
            var translation = zoom_control.translate()
            zoom_control.scale(value)
            vis.attr("transform", "translate("+translation+") scale("+value+")")
            fire_map_zoom(value)
        }
    }

    function zoom_out() {
        var value = zoom_control.scale() - 0.2
        if (value > zoom_out_stop) {
            var translation = zoom_control.translate()
            zoom_control.scale(value)
            vis.attr("transform", "translate("+translation+") scale("+value+")")
            fire_map_zoom(value)
        }
    }

    function reset_graph_translation() {
        // 1) do reset the svg translation matrix
        vis.attr("transform", "translate(0, 0) scale(1)") // this would be SVG native
        // zoom_control.translate(0,0) // ### fixme: does not seem to work as expected
        // zoom_control.scale(1.0) // ### fixme: does not seem to work as expected
        // console.log("Zoom Control", zoom_control, "SVG Panel", svg_panel.node(), "SVG Graph", svg_graph.node())
        // 2) setup new d4 zoom control behaviour (as subsequent d3.event.translate will return NaN)
        setup_zoom_and_drag_control()
    }

    function hide_assocs() {
        d3.selectAll("line").classed("hide", true)
    }

    function backdrop_assocs() {
        d3.selectAll("line").classed("backdrop", true)
    }

    function backdrop_topics() {
        d3.selectAll("rect").classed("backdrop", true)
    }

    function show_assocs() {
        d3.selectAll("line").classed("hide", false)
        d3.selectAll("line").classed("backdrop", false)
    }

    function hide_node_labels() {
        d3.selectAll('g.labels').classed("hide", true)
    }

    function show_node_labels() {
        d3.selectAll('g.labels').classed("hide", false)
    }

    function hide_hidden_topics() {
        d3.selectAll('[data-view-prop-visibility=false]').classed("hide", true)
    }

    function show_hidden_topics() {
        d3.selectAll('[data-view-prop-visibility=false]').classed("hide", false)
    }

    function highlight_institutions() {
        backdrop_topics()
        backdrop_assocs()
        d3.selectAll('[data-type-uri="dm4.contacts.institution"]').classed("backdrop", false)
    }

    function highlight_web_resources() {
        backdrop_topics()
        backdrop_assocs()
        d3.selectAll('[data-type-uri="dm4.webbrowser.web_resource"]').classed("backdrop", false)
    }

    function highlight_files() {
        backdrop_topics()
        backdrop_assocs()
        d3.selectAll('[data-type-uri="dm4.files.file"]').classed("backdrop", false)
    }

    function highlight_persons() {
        backdrop_topics()
        backdrop_assocs()
        d3.selectAll('[data-type-uri="dm4.contacts.person"]').classed("backdrop", false)
    }

    function highlight_notes() {
        backdrop_topics()
        backdrop_assocs()
        d3.selectAll('[data-type-uri="dm4.notes.note"]').classed("backdrop", false)
    }

    function pop_visual_by_topic_id(id) {
        // console.log(" NYI: pop node radius for topic ", id)
        // var el = d3.select("#" + id).classed('show', true)
    }

    // --- Puiblic Graph Panel API ---

    return {
        init: init_panel,
        show_topicmap: show_topicmap,
        highlight_topic: pop_visual_by_topic_id,
        get_topicmap_bounds: get_topicmap_bounds,
        get_viewport_size: get_viewport_size,
        resize: resize_viewport,
        zoom_in: zoom_in,
        zoom_out: zoom_out,
        focus_topic: focus_topic_by_id,
        reset_viewport: reset_graph_translation,
        clear: clear_map_panel,
        listen_to: listen_to,
        hide_assocs: hide_assocs,
        show_assocs: show_assocs,
        hide_topics_hidden: hide_hidden_topics,
        show_topics_hidden: show_hidden_topics,
        hide_node_labels: hide_node_labels,
        show_node_labels: show_node_labels,
        high_institutions: highlight_institutions,
        high_websites: highlight_web_resources,
        high_files: highlight_files,
        high_persons: highlight_persons,
        high_notes: highlight_notes
    }

})
