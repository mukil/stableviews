
define(function(require) {

    require('stableviews_ctrl')
    require('common')

    var view_state      = ""
    var svg_panel       = undefined

    var width           = window.innerWidth - (window.innerWidth / 10),
        height          = window.innerHeight - (window.innerHeight / 3),
        shiftKey, ctrlKey

    var map_topic, all_nodes, all_edges = undefined

    var node_offset_x   = 20
    var node_offset_y   = 10
    //
    var node_circle_w   = 50
    var node_edge_r     = 25
    var node_link_y_off = 12

    var zoom_control    = undefined

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

    function render_network() {

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
        node_sel.enter().append("rect") // operations for new elements
                .attr("id", function(d) { return d.id })
                .attr("data-view-prop-visibility", function(d) { return d.view_props['dm4.topicmaps.visibility'] })
                .attr("data-type-uri", function(d) { return d.type_uri })
                .attr("data-type-label", function(d) { return d.value })
                // ### make unique .attr("tabindex", 100)
                .attr("width", node_circle_w).attr("height", node_circle_w)
                .attr("rx", node_edge_r).attr("ry", node_edge_r)
                .attr("x", function(d) { return d.view_props['dm4.topicmaps.x'] - node_offset_x })
                .attr("y", function(d) { return d.view_props['dm4.topicmaps.y'] - node_offset_y })
                .on("dblclick", function(d) { d3.event.stopPropagation() })
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

        setup_zoom_and_drag_control()

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
            link_sel.filter(function(d) { return d.source.selected })
                .attr("x1", function(d) { return d.source.view_props['dm4.topicmaps.x'] })
                .attr("y1", function(d) { return d.source.view_props['dm4.topicmaps.y'] + node_link_y_off })
            link_sel.filter(function(d) { return d.target.selected })
                .attr("x2", function(d) { return d.target.view_props['dm4.topicmaps.x'] })
                .attr("y2", function(d) { return d.target.view_props['dm4.topicmaps.y'] + node_link_y_off })
        }

    }

    // --- Graph Page Helpers

    function set_page_title(title) {
        // d3.select('title').text(title)
        // d3.select('.container .text').transition().style('height', String("100%")).duration(1000)
        d3.select('h1.title').text(title)
    }

    function set_page_description(text) {
        if (text === "") {
            d3.select('.text').classed('show', false)
            return
        }
        d3.select('.text').classed('show', true)
            .html(text)
    }

    function set_page_class(type) {
        d3.select('.container').attr('class', 'container ' + type)
    }

    function show_topicmap(topicmap) {
        if (!svg_panel)
            init_panel()

        if (topicmap) {
            if (topicmap.topics) {
                map_topic = topicmap
                all_nodes = topicmap.topics
                all_edges = topicmap.assocs
                set_page_title(map_topic.info.value)
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

    // --- Graph Renderer Helper Methods

    function get_topic_by_id(topicId) {
        for (var idx in all_nodes) {
            if (topicId === all_nodes[idx].id) {
                return all_nodes[idx]
            }
        }
    }

    function setup_zoom_and_drag_control() {
        zoom_control = d3.behavior.zoom()
            .scaleExtent([0.3,2]) // ### maybe set center
            .x(xScale).y(yScale)
            .on("zoom", zoom_and_pan)
            .on("zoomend", zoom_and_pan_end)
        svg_panel.call(zoom_control)

        function zoom_and_pan() {
            vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }

        function zoom_and_pan_end() {
            fire_map_transformation(vis.attr("transform"))
        }
        /* ### disable scroll zoom (activate panning)
        drag_control = d3.behavior.drag()
            .on("drag", pan)
            .on("dragend", pan_end)
            .origin(function() {
                var svg_dom = svg_panel[0][0].firstChild.children[0]
                console.log("event", d3.event)
                console.log("svg_panel", svg_dom["transform"])
                return { x: svg_dom.x, y: svg_dom.y }
            })
        svg_panel.call(drag_control) **/
    }

    // --- Visualization Adjustment Methods

    function get_topicmap_bounds() {
        return svg_graph.node().getBBox()
    }

    function get_viewport_size() {
        return { "width": svg_panel.attr("width"), "height": svg_panel.attr("height") }
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

    function hide_hidden_topics() {
        d3.selectAll('[data-view-prop-visibility=false]').classed("hidden", true)
    }

    function show_hidden_topics() {
        d3.selectAll('[data-view-prop-visibility=false]').classed("hidden", false)
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
        set_title: set_page_title,
        set_description: set_page_description,
        set_page_type: set_page_class,
        highlight_topic: pop_visual_by_topic_id,
        get_topicmap_bounds: get_topicmap_bounds,
        get_viewport_size: get_viewport_size,
        reset_viewport: reset_graph_translation,
        clear: clear_map_panel,
        listen_to: listen_to,
        hide_assocs: hide_assocs,
        show_assocs: show_assocs,
        hide_topics_hidden: hide_hidden_topics,
        show_topics_hidden: show_hidden_topics,
        high_institutions: highlight_institutions,
        high_websites: highlight_web_resources,
        high_persons: highlight_persons,
        high_notes: highlight_notes
    }

})
