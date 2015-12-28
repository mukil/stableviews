
dm4c.add_plugin('de.mikromedia.stableviews', function() {

    var topicmaps = undefined

    dm4c.add_listener("init_3", function() {
        topicmaps = dm4c.get_plugin("de.deepamehta.topicmaps")
        show_stableviews_link(topicmaps.get_topicmap().get_id())
    })

    function show_stableviews_link(map_id) {
        var $link = jQuery('<a href="#stableviews" id="stableviews-link">View with stableviews</a>')
        jQuery('#topicmap-panel').append($link)
        $link.click(function(e) {
            window.location.assign('/de.mikromedia.stableviews/#' + topicmaps.get_topicmap().get_id())
        })
    }

})
