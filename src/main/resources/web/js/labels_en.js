/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


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
    "dm4.files.folder" : "Ordner"
}

function get_label(type_uri) {
    if (!label.hasOwnProperty(type_uri)) {
        console.warn("No label translation available, yet.", type_uri)
    }
    return label[type_uri]
}