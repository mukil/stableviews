
define(["knockout", "modules/controller"], function (ko, page_route) {

    // --- Model instance variables

    var from_time = ko.observable(undefined)
    var to_time = ko.observable(undefined)
    var timerange = ko.observableArray([])
    var items = ko.observableArray([])
    var selected_item = ko.observable(undefined)
    var current_tags = ko.observableArray([])
    //
    var types = {
            topic_types: ko.observableArray([]),
            assoc_types: ko.observableArray([])
        }
    var tags = ko.observableArray([])
    var profile = ko.observable(undefined)
    var logged_in_user = ko.observable(undefined)
    //
    var view_states = {
            timestamp_option: ko.observable("modified")
            /** type_filter: ko.observableArray(
                ["org.deepamehta.moodle.items", "org.deepamehta.resources.resource", "dm4.tags.tag"]
            ),
            tag_filter: ko.observableArray([]) **/
        }
    // labels
    var monthNames = [ "Januar", "Februar", "März", "April", "Mai", "Juni",
        "July", "August", "September", "Oktober", "November", "Dezember" ];

    // --- Private model update methods

    var update_selected_item = function (item) {
        selected_item(item)
        // console.log("Selected item " + selected_item().id)
    }

    var date_format = function (timestamp) {
        try {
            var date = new Date(timestamp)
            var date_string = '' + date.getDate() + '.' + monthNames[date.getMonth()] + ' '
                        + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes() + ' Uhr'
            return date_string
        } catch (e) {
            throw Error(e)
        }
    }

    return {
        set_from_time: function (new_from) {
            from_time(date_format(new_from))
        },
        get_from_time: function () {
            return from_time
        },
        set_to_time: function (new_to) {
            to_time(date_format(new_to))
        },
        get_to_time: function () {
            return to_time
        },
        set_timerange: function (new_range) {
            timerange = new_range  // observableArray?
        },
        get_timerange: function () {
            return timerange
        },
        set_items: function (new_items) {
            console.log("Loaded Timeline Topics", new_items)
            items(new_items) // observableArray?
        },
        get_items: function () {
            return items
        },
        set_current_tags: function (new_tags) {
            current_tags(new_tags)
        },
        get_current_tags: function () {
            return current_tags
        },
        click_list_item: function (list_item) {
            update_selected_item(list_item)
            page_route.render_item_content(list_item)
            return true
        },
        get_selected_item: selected_item,
        get_timestamp_option: function () {
            // console.log("Timestamp Option", view_states.timestamp_option())
            return view_states.timestamp_option()
        },
        set_timestamp_option: function (timestamp) {
            return view_states.timestamp_option(timestamp)
        }
    }

})
