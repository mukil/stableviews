
dm4c.add_plugin('de.mikromedia.stableviews', function() {

    var topicmaps = undefined

    dm4c.add_listener("init_3", function() {
        topicmaps = dm4c.get_plugin("de.deepamehta.topicmaps")
        show_stableviews_link()
    })

    // adding "Timeline" link to help menu
    dm4c.toolbar.special_menu.add_item({
        label: "Timeline View", handler: go_to_timeline_view
    })
    // adding "Hexmap" link to help menu
    dm4c.toolbar.special_menu.add_item({
        label: "Hexagon View", handler: go_to_hexagon_view
    })

    function show_stableviews_link() {
        var $link = jQuery('<a href="#stableviews" id="stableviews-link">View with stableviews</a>')
        jQuery('#topicmap-panel').append($link)
        $link.click(function(e) {
            if (topicmaps.get_topicmap()) {
                window.location.assign('/stableviews/#' + topicmaps.get_topicmap().get_id())   
            } else {
                console.log("Topicmaps Plugin getTopicmap: ", topicmaps.get_topicmap())
            }
        })
        if (!topicmaps.get_topicmap()) {
            console.log("Topicmaps Plugin getTopicmap: ", topicmaps.get_topicmap())
        }
    }

    function go_to_timeline_view() {
            window.location.assign("/stableviews/timeline")
    }

    function go_to_hexagon_view() {
            window.location.assign("/stableviews/hexmap")
    }

})
