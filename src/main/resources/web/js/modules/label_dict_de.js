
define(function() {
    
    var label = {
        "dm4.contacts.person" : "Person",
        "dm4.contacts.institution" : "Institution",
        "dm4.contacts.notes" : "Notiz zum Kontakt",
        "dm4.notes.note" : "Notiz",
        "dm4.notes.text" : "Notiz",
        "dm4.notes.title" : "Name der Notiz",
        "dm4.webbrowser.web_resource" : "Webseite",
        "dm4.topicmaps.topicmap": "Topicmap",
        "dm4.webclient.search": "Suche",
        "dm4.files.file" : "Datei",
        "dm4.files.folder" : "Dateiordner",
        "dm4.core.topic_type" : "Topic Typ",
        "dm4.webbrowser.url" : "URL",
        "dm4.webbrowser.webpage" : "Webpage",
        "dm4.workspaces.workspace" : "Workspace",
        "dm4.tags.tag": "Schlagwort",
        "dm4.accesscontrol.username": "Username",
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
        get_label: function(type_uri) {
            if (!label.hasOwnProperty(type_uri)) {
                // console.log("No LABEL translation available, yet.", type_uri)
            }
            return label[type_uri]
        }
    }

})
