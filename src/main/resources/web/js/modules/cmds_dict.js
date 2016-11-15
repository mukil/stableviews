
define(function() {

    var cmds = {
        "open" : ["Topicmap"],
        "?" : ["Everything"],
        "search" : ["Everything"],
        "hide" : ["Topics", "Associations", "Names", "Hidden Items"],
        "show" : ["Topics", "Associations", "Names", "Hidden Items"]
    }

    return {
        get_option: function(key) {
            if (cmds.hasOwnProperty(key)) {
                return cmds[key]
            } else {
                console.log("Could not fetch map of command opions from commands_dict")
            }
        }
    }

})
