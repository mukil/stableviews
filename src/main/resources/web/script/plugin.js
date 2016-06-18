
dm4c.add_plugin('de.mikromedia.stableviews', function() {

    var topicmaps = undefined

    dm4c.add_listener("init_3", function() {
        topicmaps = dm4c.get_plugin("de.deepamehta.topicmaps")
        show_stableviews_link(topicmaps.get_topicmap().get_id())
    })

    // adding "Timeline" link to help menu
    dm4c.toolbar.special_menu.add_item({
        label: "Timeline", handler: go_to_timeline_view
    })

    function show_stableviews_link(map_id) {
        var $link = jQuery('<a href="#stableviews" id="stableviews-link">View with stableviews</a>')
        jQuery('#topicmap-panel').append($link)
        $link.click(function(e) {
            window.location.assign('/stableviews/#' + topicmaps.get_topicmap().get_id())
        })
    }

    function go_to_timeline_view() {
            window.location.assign("/stableviews/timeline")
    }

})
