
define(function (require) {

    require('stableviews_ctrl')
    require('common')

    var view_state      = ""
    var svg_panel       = undefined

    var width           = window.innerWidth - (window.innerWidth / 5),
        height          = window.innerHeight - (window.innerHeight / 3),
        shiftKey, ctrlKey

    var map_topic, all_nodes, all_edges = undefined

    var node_offset_x   = 20
    var node_offset_y   = 10

    var zoom_control    = undefined

    var svg_graph, vis, link, node = undefined

    var xScale = d3.scale.linear().domain([0,width]).range([0,width])
    var yScale = d3.scale.linear().domain([0,height]).range([0, height])

    // ------ Initialization of page (according to view_state)

    function init_panel () {

        svg_panel = d3.select("#map-panel")
            .on("keydown", key_down)
            .on("keyup", key_up)
            .each(function() { this.focus() })
            .append("svg")
                .attr("width", width)
                .attr("height", height)

        // ### enable moving of selected topics via arrow-keys
        function key_down () {
            shiftKey = d3.event.shiftKey || d3.event.metaKey
            ctrlKey = d3.event.ctrlKey
            if (shiftKey) {
                // ### 
            }
        }

        function key_up () {
            shiftKey = d3.event.shiftKey || d3.event.metaKey
            ctrlKey = d3.event.ctrlKey
        }
    }

    function render_network () {

        svg_panel.attr("id", "topicmap-" + map_topic.info.id)

        zoom_control = d3.behavior.zoom()
            .scaleExtent([0.1,10])
            .x(xScale).y(yScale)
            .on("zoom", zoom_and_pan)
            .on("zoomend", zoom_and_pan_end)
        svg_panel.call(zoom_control)

        svg_graph = svg_panel.append('svg:g')
        vis = svg_graph.append("svg:g").attr('id', 'vis').attr('opacity', 1)

        // prepare association view-model (get coordinates from topics)
        all_edges.forEach(function(d) {
            d.source = get_topic_by_id(d.role_1.topic_id)
            d.target = get_topic_by_id(d.role_2.topic_id)
        })
    
        link = vis.append("g").attr("class", "links").selectAll("line")
            .data(all_edges).enter().append("line")
            .attr("id", function (d) { return d.id })
            .attr("data-type-uri", function (d) { return d.type_uri })
            .attr("x1", function(d) { return d.source.view_props['dm4.topicmaps.x'] })
            .attr("y1", function(d) { return d.source.view_props['dm4.topicmaps.y'] })
            .attr("x2", function(d) { return d.target.view_props['dm4.topicmaps.x'] })
            .attr("y2", function(d) { return d.target.view_props['dm4.topicmaps.y'] })

        node = vis.append("g").attr("class", "topics").selectAll("rect")
            .data(all_nodes).enter().append("rect")
            .attr("id", function (d) { return d.id })
            .attr("data-type-uri", function (d) { return d.type_uri })
            .attr("data-type-label", function (d) { return d.value })
            .attr("tabindex", 100)
            .attr("width", 50).attr("height", 20)
            .attr("rx", 5).attr("ry", 5)
            .attr("x", function(d) { return d.view_props['dm4.topicmaps.x'] - node_offset_x })
            .attr("y", function(d) { return d.view_props['dm4.topicmaps.y'] - node_offset_y })
            .on("dblclick", function(d) { d3.event.stopPropagation() })
            .on("click", function(d) {
                if (!shiftKey) {
                    //if the shift key isn't down, unselect everything
                    node.classed("selected", function(p) { 
                        return p.selected =  p.previouslySelected = false 
                    })
                }
                // fire about selection
                var selection = node.filter(function(d) { return d.selected })
                if (selection[0].length >= 2) {
                    fire_multi_selection(selection[0])
                } else {
                    fire_item_selection(d)
                }
                // always select this node
                d3.select(this).classed("selected", d.selected = !d.previouslySelected)
            })
            .on("mouseup", function(d) {
                //if (d.selected && shiftKey) d3.select(this).classed("selected", d.selected = false);
            })
            .call(d3.behavior.drag()
                .origin(function(d) { return d })
                .on("dragstart", dragstarted)
                .on("drag", dragged)
                .on("dragend", dragended))

        function dragstarted (d) {
            d3.event.sourceEvent.stopPropagation() // ###
            if (!d.selected && !shiftKey) {
                // if this node isn't selected, then we have to unselect every other node
                node.classed("selected", function(p) { return p.selected =  p.previouslySelected = false })
            }
            d3.select(this).classed("selected", function(p) { 
                d.previouslySelected = d.selected
                return d.selected = true 
            })
        }
 
        function dragged (d) {
            move(d3.event.dx, d3.event.dy)
        }

        function dragended (d) {
            // node.filter(function(d) { return d.selected })
                // .each(function(d) { d.fixed &= ~6; })
        }

        function move (dx, dy) {
            node.filter(function(d) { return d.selected })
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
            link.filter(function(d) { return d.source.selected })
                .attr("x1", function(d) { return d.source.view_props['dm4.topicmaps.x'] })
                .attr("y1", function(d) { return d.source.view_props['dm4.topicmaps.y'] })
            link.filter(function(d) { return d.target.selected })
                .attr("x2", function(d) { return d.target.view_props['dm4.topicmaps.x'] })
                .attr("y2", function(d) { return d.target.view_props['dm4.topicmaps.y'] })
        }

        function zoom_and_pan () {
            vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }

        function zoom_and_pan_end() {
            fire_map_transformation(vis.attr("transform"))
        }

    }

    function set_page_title (title) {
        d3.select('title').text(title)
        d3.select('h1.title').text(title)
    }

    function set_page_description (text) {
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

    function pop_visual_by_topic_id (id) {
        console.log(" NYI: pop node radius for topic ", id)
        // var el = d3.select("#" + id).classed('show', true)
    }

    function show_topicmap (topicmap) {
        if (typeof svg_panel === "undefined")
            init_panel()

        if (typeof topicmap !== "undefined") {
            if (typeof topicmap.topics !== "undefined") {
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
        fire_rendered_topicmap()
    }

    function hide_Assocs () { // messing up the method signatures frankenstyle_Camel
        // console.log("> hiding associations")
        // all_edges, link = undefined
        // console.log(all_edges, link) // ## i thougt d3 manipulates the dom when i remove the data ...
        // d3.selectAll("links").classed("hide", true)
        d3.selectAll("line").classed("hide", true)
    }

    function show_Assocs () { // messing up the method signatures frankenstyle_Camel
        d3.selectAll("line").classed("hide", false)
    }

    function clear_map_panel () {
        if (typeof svg_panel !== "undefined") {
            svg_panel = undefined
            d3.select('#map-panel svg').remove() // ## fix: should not clear our text-area
        }
    }

    function listen_to (event_name, handler) {
        svg_panel[0][0].addEventListener(event_name, handler)
    }

    function fire_item_selection (item) {
        svg_panel[0][0].dispatchEvent(new CustomEvent('selection', { detail: item }))
    }

    function fire_multi_selection (items) {
        svg_panel[0][0].dispatchEvent(new CustomEvent('multi_selection', { detail: items }))
    }

    function fire_rendered_topicmap () {
        svg_panel[0][0].dispatchEvent(new CustomEvent('rendered_topicmap', { detail: map_topic }))
    }

    function fire_map_transformation (value) {
        svg_panel[0][0].dispatchEvent(new CustomEvent('topicmap_transformed', { detail: value }))
    }

    // --- Graph Renderer Helper Methods

    function get_topic_by_id (topicId) {
        for (var idx in all_nodes) {
            if (topicId === all_nodes[idx].id) {
                return all_nodes[idx]
            }
        }
    }
    
    return {
        init: init_panel,
        show_topicmap: show_topicmap,
        set_title: set_page_title,
        set_description: set_page_description,
        set_page_type: set_page_class,
        highlight_topic: pop_visual_by_topic_id,
        clear_panel: clear_map_panel,
        listen_to: listen_to,
        hide_assocs: hide_Assocs,
        show_assocs: show_Assocs
    }

})
