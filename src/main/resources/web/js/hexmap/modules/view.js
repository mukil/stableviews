
define(['d3', 'd3hexbin', 'modules/rest_client', 'lang'], function(d3, d3hexbin, restc, labels) {

    console.log("Labels Component", labels)
    // setup default values for our hexmap dislay
    // ###
    // view model
    var results = []

    var view = {

        init: function() {
            // load standard type topics to display
            restc.load_topics_by_type("dmx.notes.note", function(notes) {
                console.log("Loaded Notes", notes.length)
                restc.load_topics_by_type("dmx.contacts.person", function(person) {
                    console.log("Loaded Persons", person.length)
                    restc.load_topics_by_type("dmx.contacts.organization", function(inst) {
                        console.log("Loaded Institutions", inst.length)
                        restc.load_topics_by_type("dmx.bookmarks.bookmark", function(websites) {
                            console.log("Loaded Bookmarks", websites.length)
                            results = d3.merge([notes, websites, person, inst])
                            console.log("Topic Data Count", results.length)
                            view.render_hexmap()
                            d3.select('.data-container').attr("style", "display: none")
                        })
                    })
                })
            })
            // check username
            restc.get_username(function(response) {
                if (response.length > 0) {
                    d3.select('#menu .username').text('Angemeldet als ' + response)
                } else {
                    d3.select('#menu .username').html('<a href="/systems.dmx.webclient/#">Login</a>')
                }
            })
        },

        render_hexmap:  function () {
            
            var margin = {top: 20, right: 30, bottom: 0, left: 30 },
                width = (window.innerWidth - 75) - margin.left - margin.right,
                height = window.innerHeight - margin.top - margin.bottom;

            var RANGE_END = 150
            var STEPS = 0.5
            var HEX_RADIUS = 10
            var CENTER_X = width/2
            var CENTER_Y = height/2

            var randomX = d3.random.normal(CENTER_X, RANGE_END, STEPS),
                randomY = d3.random.normal(CENTER_Y, RANGE_END, STEPS),
                points = d3.range(results.length)
                    .map(function() {
                        return [randomX(), randomY()];
                    });

            var viewTopics = []
            for (var hi = 0; hi < results.length; hi++) {
                var point = points[hi]
                    point.push(results[hi])
                viewTopics.push(point)
            }

            var hexagonCount = 0; 
            var hexbin = d3.hexbin()
                .size([width, height])
                .radius(HEX_RADIUS);

            var svg = d3.select("#hexmap").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

                svg.append("clipPath")
                    .attr("id", "clip")
                  .append("rect")
                    .attr("class", "mesh")
                    .attr("width", width)
                    .attr("height", height)
                svg.append("g")
                    .attr("clip-path", "url(#clip)")
                  .selectAll(".hexagon")
                    .data(hexbin(viewTopics))
                  .enter().append("path")
                    .attr("class", "hexagon")
                    .attr("d", hexbin.hexagon())
                    .attr("transform", function(d) {
                        hexagonCount++
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                    .style("fill", function(d) {
                        var typeUri = d[0][d[0].length-1].typeUri
                        if (typeUri === "dmx.notes.note") {
                            return "#ffe651";    
                        } else if (typeUri === "dmx.contacts.person") {
                            return "#343434";
                        } else if (typeUri === "dmx.contacts.organization") {
                            return "#c10000";
                        } else if (typeUri === "dmx.bookmarks.bookmark") {
                            return "#4095f6";
                        } else if (typeUri === "dmx.files.file" || d.typeUri === "dmx.files.folder") {
                            return "#999999";
                        } else {
                            return "#666666";
                        }
                    })
                    .on("click", function(d) {
                        var pointData = d[0]
                        var topic = pointData[pointData.length-1]
                        console.log("Topic Selected", topic)
                        if (topic.typeUri === "dmx.bookmarks.bookmark") {
                            window.document.location.assign(topic.value)
                        } else {
                            window.document.location.assign("/stableviews/topic/" + topic.id)
                        }
                    })
                    .attr("data-type-uri", function(d) {
                        var pd = d[0]
                        return pd[pd.length-1].typeUri
                    })
                    .attr("alt", function(d) {
                        var pd = d[0]
                        return undefined
                    })
                    .append("svg:title").text(function(d) {
                        var pd = d[0]
                        var typeUri = pd[pd.length-1].typeUri
                        return pd[pd.length-1].value + " ("+labels.get_label(typeUri)+")"
                    })

            // var topics = model.get_timerange()
            console.log("Loaded ", results.length, "topics, Hexagons rendered", hexagonCount, ", Nr. of random Points", points.length)
            // topics.sort(timestamp_sort_ascending)
            d3.select('.hexagon-info .state').text(hexagonCount + " Topics")
            d3.select('.hexagon-info .parameter').text(RANGE_END + " Range End, Steps " + STEPS + ", Hex Radius " + HEX_RADIUS)

            function timestamp_sort_ascending(a, b) {
                var timestampUri = "dmx.timestamps.created"
                var scoreA = 0
                var scoreB = 0
                if (a.children.hasOwnProperty(timestampUri)) scoreA = a.children[timestampUri].value
                if (b.children.hasOwnProperty(timestampUri)) scoreB = b.children[timestampUri].value
                if (scoreA > scoreB) // sort string descending
                  return -1
                if (scoreA < scoreB)
                  return 1
                return 0 //default return value (no sorting)
            }

        }

    }

    return view

})
