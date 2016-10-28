
define(["modules/controller"], function (page_route) {

    // --- Model instance variables

    var from_time = 0
    var to_time = 0
    var max_from_time = 0
    var max_to_time = 0
    var range_plus = 0

    var timerange = []
    var items = []
    var item_count = 0

    var selected_item = undefined
    var current_tags = []
    //
    var types = {
        topic_types: [],
        assoc_types: []
    }
    var tags = []
    var profile = []
    var logged_in_user = []
    //
    var view_states = {
        timestamp_option: "created"
    }
    // labels
    var monthNames = [ "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember" ];

    // --- Private model update methods

    var update_selected_item = function (item) {
        selected_item = item
        // console.log("Selected item " + selected_item().id)
    }

    var date_format = function (timestamp) {
        try {
            var date = new Date(timestamp)
            var minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes()
            var hours = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours()
            var date_string = '' + date.getDate() + '.' + monthNames[date.getMonth()] + ' '
                        + date.getFullYear() + ', ' + date.getHours() + ':' + minutes + ' Uhr'
            return date_string
        } catch (e) {
            throw Error(e)
        }
    }

    return {
        format_date: date_format,
        set_items: function(new_items) {
            item_count = new_items.length
            items = new_items // observableArray?
        },
        get_item_count: function() {
            return item_count
        },
        get_items: function() {
            return items
        },
        click_item: function (list_item) {
            update_selected_item(list_item)
            page_route.render_item_content(list_item)
            return true
        },
        toggle_timerange_dialog: function() {
            page_route.adjust_timerange()
        },
        get_selected_item: selected_item
    }

})
