package de.mikromedia.stableviews;



import java.util.logging.Logger;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.Consumes;

import de.deepamehta.core.Topic;

import de.deepamehta.core.osgi.PluginActivator;
import de.deepamehta.core.service.Inject;
import de.deepamehta.core.service.Transactional;
import de.deepamehta.topicmaps.TopicmapsService;
import de.deepamehta.topicmaps.model.TopicmapViewmodel;
import de.mikromedia.stableviews.model.StableviewsTopicmapModel;
import java.io.InputStream;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.core.MediaType;


/**
 * @author Malte Reißig (<malte@mikromedia.de>)
 * @website http://github.com/mukil/stableviews
 * @version 0.4-SNAPSHOT - compatible with DM 4.7
 *
 */
@Path("/stableviews")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class StableviewsPlugin extends PluginActivator {

    private Logger log = Logger.getLogger(getClass().getName());

    // --- Topicmap Extension URIs

    static final String PROP_MAP_STYLESHEET = "dm4.topicmaps.stylesheet";

    @Inject
    private TopicmapsService tmService;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public StableviewsTopicmapModel getStyledTopicmap(@PathParam("id") long topicmapId) {
        TopicmapViewmodel topicmapViewModel = tmService.getTopicmap(topicmapId, true);
        StableviewsTopicmapModel svtm = new StableviewsTopicmapModel(topicmapViewModel);
        enrichWithCustomStylesheet(svtm, topicmapViewModel.getId());
        return svtm;
    }

    @GET
    @Path("/")
    @Produces(MediaType.TEXT_HTML)
    public InputStream getStableviewsIndex() {
        return getStaticResource("web/index.html");
    }

    @GET
    @Path("/timeline")
    @Produces(MediaType.TEXT_HTML)
    public InputStream getTimelineView() {
        return getStaticResource("web/timeline.html");
    }

    @GET
    @Path("/hexmap")
    @Produces(MediaType.TEXT_HTML)
    public InputStream getHexmapView() {
        return getStaticResource("web/hexmap.html");
    }

    @POST
    @Path("/topicmap/stylesheet/{styleSheetPath}/{id}")
    @Transactional
    public void setTopicmapStylesheet(@PathParam("styleSheetPath") String cssPath, @PathParam("id") long topicmapId) {
        Topic topicmap = dm4.getTopic(topicmapId);
        if (topicmap.getTypeUri().equals("dm4.topicmaps.topicmap")) {
            log.info("Set Topicmap Stylesheet on " + topicmap.getSimpleValue());
            topicmap.setProperty(PROP_MAP_STYLESHEET, cssPath, false);
        }
    }

    public void enrichWithCustomStylesheet(StableviewsTopicmapModel topic, long topicmapId) {
        Topic topicmap = dm4.getTopic(topicmapId);
        if (topicmap.getTypeUri().equals("dm4.topicmaps.topicmap")) {
            String mapStyleURL = "/de.mikromedia.stableviews/assets/css/custom-graph.css";
            if (topicmap.hasProperty(PROP_MAP_STYLESHEET)) {
                mapStyleURL = (String) topicmap.getProperty(PROP_MAP_STYLESHEET);
            }
            topic.setMapStylesheet(mapStyleURL);
        }
    }
}
