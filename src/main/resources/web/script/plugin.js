
dm4c.add_plugin('de.mikromedia.stableviews', function() {

    var topicmaps = undefined

    dm4c.add_listener("init_3", function() {
        topicmaps = dm4c.get_plugin("de.deepamehta.topicmaps")
        show_stableviews_links()
    })

    // adding "Timeline" link to help menu
    dm4c.toolbar.special_menu.add_item({
        label: "Timeline View", handler: go_to_timeline_view
    })
    // adding "Hexmap" link to help menu
    dm4c.toolbar.special_menu.add_item({
        label: "Hexagon View", handler: go_to_hexagon_view
    })

    function show_stableviews_links() {
        var $linkArea = jQuery('<div id="stableviews-link">')
        var $standardLink = jQuery('<a href="#stableviews">View with Stableviews</a>')
            $standardLink.click(function(e) {
                if (topicmaps.get_topicmap()) {
                    window.location.assign('/stableviews/#' + topicmaps.get_topicmap().get_id())
                }
            })
        var $memexLink = jQuery('<a href="#memex">Memex Style</a>')
            $memexLink.click(function(e) {
                if (topicmaps.get_topicmap()) {
                    window.location.assign('/stableviews/memex/#' + topicmaps.get_topicmap().get_id())
                }
            })
        $linkArea.append($standardLink).append($memexLink)
        jQuery('#topicmap-panel').append($linkArea)
    }

    function go_to_timeline_view() {
            window.location.assign("/stableviews/timeline")
    }

    function go_to_hexagon_view() {
            window.location.assign("/stableviews/hexmap")
    }

})
