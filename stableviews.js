
// Load common code that includes config, then load the app logic for this page.
require(['common'], function (common) {

    require(['graph_panel', 'stableviews_ctrl'], function (graph_panel, controller) {

        var username = undefined            // 
        var topicmaps = undefined           //
        var selected_topicmap = undefined   //
        var selected_topic = undefined      //
        var suggestions = undefined         //

        // 0) ..
        graph_panel.init()

        graph_panel.listen_to('selection', function (e) {
            if (common.debug) console.log(" > selection ", e.detail)
        })

        graph_panel.listen_to('multi_selection', function (e) {
            if (common.debug) console.log(" > multi_selection ", e.detail)
        })

        graph_panel.listen_to('rendered_topicmap', function (e) {
            if (common.debug) console.log(" > rendered topicmap ", e.detail)
        })

        graph_panel.listen_to('topicmap_transformed', function (e) {
            if (common.debug) console.log(" > topicmap transformed ", e.detail)
        })

        // 1) ..
        controller.load_all_topicmaps ( function (response) {

            topicmaps = response
            selected_topicmap = topicmaps[0]

            // 1.2) ..
            controller.load_topicmap (selected_topicmap.id, function (result) {

                selected_topicmap = result
                graph_panel.show_topicmap(selected_topicmap)

            })

        })

        // -- Login View

        function render_login_dialog () {

            /** function do_auth() {
                var element = d3.select('input.vp-id')[0][0]
                newCtrl.startSession(element.value, function (){
                    window.location.reload()
                }, common.debug)
            } **/
        }

        return {}

    })

    // console.log(stable)
    // stable.show_topicmap(1)

})
