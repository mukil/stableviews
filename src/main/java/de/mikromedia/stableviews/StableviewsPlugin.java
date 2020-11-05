package de.mikromedia.stableviews;



import de.mikromedia.stableviews.model.StableviewsTopicmapModel;
import java.util.logging.Logger;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.Consumes;


import java.io.InputStream;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.core.MediaType;
import systems.dmx.core.Topic;
import systems.dmx.core.osgi.PluginActivator;
import systems.dmx.core.service.Inject;
import systems.dmx.core.service.Transactional;
import static systems.dmx.topicmaps.Constants.TOPICMAP;
import systems.dmx.topicmaps.Topicmap;
import systems.dmx.topicmaps.TopicmapsService;


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
        Topicmap topicmap = tmService.getTopicmap(topicmapId, true);
        StableviewsTopicmapModel svtm = new StableviewsTopicmapModel(topicmap);
        enrichWithCustomStylesheet(svtm, topicmap.getId());
        return svtm;
    }

    @GET
    @Path("/")
    @Produces(MediaType.TEXT_HTML)
    public InputStream getStableviewsStandardStyle() {
        return getStaticResource("web/standard-graph.html");
    }

    @GET
    @Path("/memex")
    @Produces(MediaType.TEXT_HTML)
    public InputStream getStableviewsMemexStyle() {
        return getStaticResource("web/memex-graph.html");
    }

    @GET
    @Path("/timeline")
    @Produces(MediaType.TEXT_HTML)
    public InputStream getTimelineView() {
        return getStaticResource("web/timeline-view.html");
    }

    @GET
    @Path("/hexmap")
    @Produces(MediaType.TEXT_HTML)
    public InputStream getHexmapView() {
        return getStaticResource("web/hexagon-view.html");
    }

    @POST
    @Path("/topicmap/stylesheet/{styleSheetPath}/{id}")
    @Transactional
    public void setTopicmapStylesheet(@PathParam("styleSheetPath") String cssPath, @PathParam("id") long topicmapId) {
        Topic topicmap = dmx.getTopic(topicmapId);
        if (topicmap.getTypeUri().equals(TOPICMAP)) {
            log.info("Set Topicmap Stylesheet on " + topicmap.getSimpleValue());
            topicmap.setProperty(PROP_MAP_STYLESHEET, cssPath, false);
        }
    }

    public void enrichWithCustomStylesheet(StableviewsTopicmapModel topic, long topicmapId) {
        Topic topicmap = dmx.getTopic(topicmapId);
        if (topicmap.getTypeUri().equals(TOPICMAP)) {
            String mapStyleURL = "/de.mikromedia.stableviews/assets/css/custom-graph.css";
            if (topicmap.hasProperty(PROP_MAP_STYLESHEET)) {
                mapStyleURL = (String) topicmap.getProperty(PROP_MAP_STYLESHEET);
            }
            topic.setMapStylesheet(mapStyleURL);
        }
    }
}
