
define(['d3', 'modules/rest_client', 'labels'], function(d3, restc, labels) {

    // setup default values for our time range queries
    var TIMESTAMP_NOW   = new Date()
    var DEFAULT_BACK_TO = TIMESTAMP_NOW.getTime() - (2 * 604800000) // - (~14 Days)
    var MAX_BACK_TO     = TIMESTAMP_NOW.getTime() - (12 * 604800000) // ~12weeks, ~26weeks / ~54 Weeks

    return {

        init: function() {
            // 1) fire query to initialize a defualt timeline, showing contents of the last two eeks
            restc.load_topics_in_range(DEFAULT_BACK_TO, TIMESTAMP_NOW.getTime()) // to, from
            console.log("Querying Timeline (Left Side) Since", new Date(DEFAULT_BACK_TO))
            // 2) fire query to initialize the query timeline, showing an index of contents of the last 12 weeks
            restc.load_timerange_index(MAX_BACK_TO, TIMESTAMP_NOW.getTime(), this.render_timerange_slider)
            console.log("Querying Topic Index (Right Side) Since", new Date(MAX_BACK_TO))
            // 3) set timeline header info label
            var timestamp_option = restc.get_clientside_model().get_timestamp_option()
            console.log("Timestamp Option Label", timestamp_option, get_label(timestamp_option))
            d3.select('.timestamp-option').text(get_label(timestamp_option))
        },

        render_details_in_list: function (item) {

            var body = d3.select('#topic-' + item.id + ' .body')
            // allow to toggle details in list
            console.log("Timeline Inline Rendering", item, "Display Style Attr:", body.style("display"))
            if (body.style("display").contains("block")) {
                body.style("display", "none")
                return true
            }
            // build up the html content
            var item_html = ""
            if (item.type_uri === 'dm4.files.file') {

                var filepath = '/filerepo/' + item.childs['dm4.files.path'].value
                if (item.value.contains('.pdf')) {
                    item_html = '<p><object data="'+filepath+'" width="760" height="640" type="application/pdf">'
                        + '</p>'
                        + '<a href="' +filepath+ '" class="command" title="Download PDF">Download</a>'
                        + '</p>'

                } else if (item.value.contains('.jpg') || item.value.contains('.jpeg') ||
                        item.value.contains('.png') || item.value.contains('.svg')) {

                    item_html = '<p><img src="'+filepath+'"></p>'
                } else {
                    item_html = '<a href="' +filepath+ '" class="command" title="Download">Access File</a>'
                }

            } else if (item.type_uri === 'dm4.notes.note') {

                var notes_html = item.value
                        + '<div>' + item.childs['dm4.notes.text'].value + '</div>'
                // var tags = item.childs['dm4.tags.tag']
                item_html = '<p>' + notes_html + '</p>'
                /** if (selected_item().type_uri === "org.deepamehta.resources.resource") {
                // Navigating to resource-detail view
                window.document.location = '/notes/' + selected_item().id
                */

            } else if (item.type_uri === 'dm4.webbrowser.web_resource') {

                item_html =  '<a href="' +item.childs["dm4.webbrowser.url"].value + '" class="command">Open Web Resource</a>'

            } else if (item.type_uri === 'dm4.contacts.person' || item.type_uri === 'dm4.contacts.institution') {

                item_html =  '<p>' + item.value +  '</p>'

            } else {
                console.warn("Inline Renderer for Topic Type " + item.type_uri + " NOT YET IMPLEMENTED")
            }
            // build up tags
            /** if (item.childs.hasOwnProperty('dm4.tags.tag')) {
                var list_of_tags = item.childs['dm4.tags.tag']
                item_html += '<p><span class="label">Tagged:</span>'
                for (var tag_idx in list_of_tags) {
                    var tag_item = list_of_tags[tag_idx]
                    // if (tag_idx < list_of_tags.length) item_
                    item_html +=  '<span class="tag">'
                        + '<img src="/de.deepamehta.tags/images/tag_32.png" height="16"'
                            + ' alt="Tag Icon" class="type-icon" title="Tag ' +tag_item.value+ '"/>'
                            + tag_item.value+ '</span>'
                }
                item_html += '</p>'
            } */
            // populate and display element
            body.html(item_html)
            body.style("display", "inline-block")

        },

        render_timerange_slider:  function (since, to) {

            var topics = restc.get_clientside_model().get_timerange()
                // topics.sort(timestamp_sort_ascending)
            // console.log("Loaded Timeindex", topics)
            /** var dates = []
            for (var i = 0; i < topics.length; i++) {
                var topic = topics[i]
                dates.push(topic.childs['dm4.time.modified'].value)
            }
            var youngest = new Date(dates[dates.length-1])
            var oldest = new Date(dates[0]) // -1 Day
            // var oldest = new Date(since - 10080000) // -7 Days
            console.log("Loaded Time Index Topic Dates", topics)
            dates = dates.sort(d3.descending) **/
            // console.log(dates[dates.length-1])
            console.log("Timescale Renderer Oldest", new Date(since), "Youngest", new Date(to))
            d3.select(".time-axis .loader").remove() // ##
            var timescale = d3.time.scale()
                .domain([new Date(to), new Date(since)])
                .range([0, 1200])
                .clamp(true)
                // .domain([dates[dates.length-1], new Date().getTime()])
            var yAxis = d3.svg.axis()
                .scale(timescale)
                .orient("right")
                .ticks(d3.time.weeks)
                .tickFormat(d3.time.format("%d.%B %y"))
            var area = d3.select(".time-axis")
                .append("svg")
                    .attr("class", "axis")
                    .attr("width", 240)
                    .attr("height", 1250)
                .append("g")
                    .attr("transform", "translate(100, 10)")
                    .call(yAxis)
            // setup brush control
            // ### use timeline_default-timerange to initiate our slider
            var brush = d3.svg.brush().y(timescale)
                // brush.x(50)
                brush.extent([DEFAULT_BACK_TO, TIMESTAMP_NOW])
                brush.on("brushend", onbrushmove_end)
            var sliderarea = area.append("g").attr("class", "slider-area")
                sliderarea.append("g").attr("class", "brush").call(brush)
                    .selectAll("rect")
                    .attr("x", -75)
                    .attr("y", 0)
                    .attr("width", "75")
                    .attr("fill", "#f1f1f1")
                    .attr("stroke", "#0782C1")
                    .attr("stroke-width", "1")
                    .attr("opacity", ".7")

            // ### show x-axis labeles (type-row)
            // render dotted-item
            var dots = area.selectAll("circle")
                .data(topics, function (d) {
                    return new Date(d.childs['dm4.time.modified'].value)
                })
                .enter()
                .append("circle") // append g and
                .attr("class", "dot")
                .attr("r", function (d) {
                    return 4
                })
                .attr("cx", function (d) {
                    if (d.type_uri === "dm4.webbrowser.web_resource") {
                        return -10
                    } else if (d.type_uri === "dm4.notes.note") {
                        return -22
                    } else if (d.type_uri === "dm4.files.file" || d.type_uri === "dm4.files.folder") {
                        return -35
                    } else if (d.type_uri === "dm4.contacts.institution") {
                        return -48
                    } else if (d.type_uri === "dm4.contacts.person") {
                        return -60
                    } else {
                        return -70
                    }
                })
                .attr("cy", function (d) {
                    return timescale(d.childs['dm4.time.created'].value)
                })
                .attr("fill", function (d) {
                    if (d.type_uri === "dm4.webbrowser.web_resource") {
                        return "#4095f6"
                    } else if (d.type_uri === "dm4.notes.note") {
                        return "#faeb5b"
                    } else if (d.type_uri === "dm4.files.file" || d.type_uri === "dm4.files.folder") {
                        return "#999999"
                    } else if (d.type_uri === "dm4.contacts.institution") {
                        return "#c10000"
                    } else if (d.type_uri === "dm4.contacts.person") {
                        return "#343434"
                    } else {
                        return "#666666"
                    }
                })
                // ### maybe use http://bl.ocks.org/biovisualize/1016860 or make use of
                // d3-tip https://github.com/caged/d3-tip like http://bl.ocks.org/Caged/6476579
                .append("svg:title")
                .text(function(d) {
                    if (d.type_uri === "dm4.webbrowser.web_resource") {
                        return "Web Resource, Modified " + new Date(d.childs['dm4.time.modified'].value)
                    } else if (d.type_uri === "dm4.notes.note") {
                        return "Note (Modified: " + new Date(d.childs['dm4.time.modified'].value)
                    } else if (d.type_uri === "dm4.files.file" || d.type_uri === "dm4.files.folder") {
                        return "File or Folder, Modified " + new Date(d.childs['dm4.time.modified'].value)
                    } else if (d.type_uri === "dm4.contacts.institution") {
                        return "Institution, Modified " + new Date(d.childs['dm4.time.modified'].value)
                    } else if (d.type_uri === "dm4.contacts.person") {
                        return "Person, Modified " + new Date(d.childs['dm4.time.modified'].value)
                    }
                })

            function onbrushmove_end (e) {
                var s = brush.extent();
                // xScale.domain( s);
                console.log('on brush move', brush.empty(), s[0],s[1]);
                // document.getElementById('abc').innerHTML = s[0]+ "     "+s[1];
                var from = new Date(s[0]).getTime()
                var to = new Date(s[1]).getTime()
                restc.load_topics_in_range(from, to)
                //
                // render spinning wheel..
                //
            }

            function timestamp_sort_ascending(a, b) {
                var timestampUri = "dm4.time.modified"
                var scoreA = 0
                var scoreB = 0
                if (a.childs.hasOwnProperty(timestampUri)) scoreA = a.childs[timestampUri].value
                if (b.childs.hasOwnProperty(timestampUri)) scoreB = b.childs[timestampUri].value
                if (scoreA > scoreB) // sort string descending
                  return -1
                if (scoreA < scoreB)
                  return 1
                return 0 //default return value (no sorting)
            }

        }

    }

})
