
define(function() {
    
    var label = {
        "dmx.contacts.person" : "Person",
        "dmx.contacts.organization" : "Organization",
        "dmx.contacts.notes" : "Notiz zum Kontakt",
        "dmx.notes.note" : "Notiz",
        "dmx.notes.text" : "Notiz",
        "dmx.notes.title" : "Name der Notiz",
        "dmx.topicmaps.topicmap": "Topicmap",
        "dmx.webclient.search": "Suche",
        "dmx.files.file" : "Datei",
        "dmx.files.folder" : "Dateiordner",
        "dmx.core.topic_type" : "Topic Typ",
        "dmx.base.url" : "URL",
        "dmx.bookmarks.bookmark" : "Bookmark",
        "dmx.workspaces.workspace" : "Workspace",
        "dmx.tags.tag": "Schlagwort",
        "dmx.accesscontrol.username": "Username",
        "de.mikromedia.page": "Webpage",
        "ka2.geo_object": "Geo Objekt",
        "Reset": "Zur&uuml;cksetzen",
        "Open Webpage": "Webseite &ouml;ffnen",
        "modified": "bearbeitet",
        "created": "erstellt"
    }

    var monthNames = [ "Januar", "Februar", "März", "April", "Mai", "Juni",
        "July", "August", "September", "Oktober", "November", "Dezember" ]

    return {
        get_month_name: function(idx) {
            return monthNames[idx]
        },
        get_label: function(typeUri) {
            if (!label.hasOwnProperty(typeUri)) {
                // console.log("No LABEL translation available, yet.", typeUri)
            }
            return label[typeUri]
        }
    }

})
