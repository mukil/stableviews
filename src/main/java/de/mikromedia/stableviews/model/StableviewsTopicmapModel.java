package de.mikromedia.stableviews.model;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import systems.dmx.core.JSONEnabled;
import systems.dmx.topicmaps.Topicmap;

public class StableviewsTopicmapModel implements JSONEnabled {
    
    JSONObject json = new JSONObject();

    public StableviewsTopicmapModel(Topicmap topicmapViewmodel) {
        json = topicmapViewmodel.toJSON();
    }
    
    public void setMapStylesheet(String cssPath) {
        try {
            json.put("config", new JSONObject().put("dm4.topicmaps.stylesheet", cssPath));
        } catch (JSONException ex) {
            Logger.getLogger(StableviewsTopicmapModel.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public JSONObject toJSON() {
        return json;
    }
    
}
