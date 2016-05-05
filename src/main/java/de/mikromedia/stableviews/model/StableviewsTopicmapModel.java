package de.mikromedia.stableviews.model;

import de.deepamehta.core.JSONEnabled;
import de.deepamehta.plugins.topicmaps.model.TopicmapViewmodel;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

public class StableviewsTopicmapModel implements JSONEnabled {
    
    JSONObject json = new JSONObject();

    public StableviewsTopicmapModel(TopicmapViewmodel topicmapViewmodel) {
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
