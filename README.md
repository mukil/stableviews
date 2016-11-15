
### Stableviews UI

A DeepaMehta 4 plugin delivering alternate user interfaces to present work done in _Topicmaps_. My freestyle project for DeepaMehta 4.

This bundle currently comes with three type of _views_ for content authored in DeepaMehta:

 - Topicmaps Reader Standard Style - Think of nodes, edges, labels and details (SVG Circles)
 - Topicmaps Reader Memex Style - Think of nodes, edges, labels and details memex style (SVG Rectangles)
 - Timeline Browser - This is actually quite useful already. Think of twitter without any "customer magic" but with the raw power of time range queries over all your _Notes_, _Contacts_, _Bookmarks_ and _Files_.
 - Hexagon Frontpage View - Think of a random startup screen visualizing your personal information for further investigation, not useful at all (yet).

Note: Please keep in mind that this software is under heavy development and the screens and dialogs might not always work at all or as expected Therefore i appreciate any help and feedback though.

Yet unavailable:

 - Advanced Search - Presenting fulltext search results with their context.

Feel free to provide me some feedback in the [Issues](https://github.com/mukil/stableviews/issues) section of this repo.

#### Getting Started

 - Install [DeepaMehta **4.8**](http://github.com/jri/deepamehta)

Note: Each of the beforementioend user dialogs are still under heavy development, sometimes do not even work at all and are just work in progress.

 - Install [dm48-littlehelpers-0.3-SNAPSHOT](http://github.com/mukil/dm4-littlehelpers)
 - Install [dm48-stableviews-0.4-SNAPSHOT](http://github.com/mukil/stableviews)

You can find the most recent builds of DeepaMehta **4.8** and the two required plugins at [http://download.deepamehta.de/nightly/](https://download.deepamehta.de/nightly/).

After working in and having created a DeepaMehta 4 Topicmap you can use the ``View in stableviews'' button in the lower left corner of the Webclient. Clicking on it you'll open the current map in the stableviews ui.

In DeepaMehta's `Help` menu you'll find the links to the `Hexago View` and `Timeline View`.

#### Development

For setting up our development please follow the description outlined in this [PluginDevelopmentGuide](https://trac.deepamehta.de/wiki/PluginDevelopmentGuide).

```
cd dm4-stableviews
mvn clean package
```

To instruct `mvn` where to copy your new build to you could point out the `bundle-deploy` directory of your DeepaMehta installation through adding a `dm4.deploy.dir` property into the `pom.xml`. Once copied DeepaMehta will then "hot-deploy" the new version.

### Inspiration

The _Topicmaps UI_ by Jörg Richter (@jri).

With this interface we draw upon the knowledge on humans  _visual memory_ ("... the blue bar at the top there") and _situative memory_ ("... as i was meeting Ben for the first time."). Furthermore we think that an item "is" or "is best described" through its relations to other items. And those relations can represent _context_. To be able do meaningful research with this tool we believe that this user interface needs to allow users of _free placement_ of items and it needs to persist those visual structures (_stable geometries_).

### Challenges

At best, we are able to address the following, more general challenges for such UI:

 * comparison: e.g. allow to compare details of any two given topics
 * ACCOMPLISHED - multi select: allow to select and trigger commands on a set of elements
 * query-ui: allow for iterative refinement of "Search Results", e.g. in forms of "Search Buckets"
 * IN PROGRESS - command line: text based interaction to control the ui (search and reveal topics in maps, filter in maps, search and load maps, "mail jri")
 * MANUALLY DO'ABLE - themes: allow to switch between many CSS definitions
 * tiled-windows: enable users to tile screen space wherever possible


### Description of difference

The difference and focus of UI research in this code repository regarding the dm4-webclient is:

* Do not aim at being a generic solution (straightaway) but first become a configurable one<br/>
  (looking at you: topic and association types)

* Aim at an _immediate_ control feel for users manipulating their view

* Enable users multi-dimensional filtering of infos (faceted navigation)<br/>
  a.k.a. introduce visualize aspects of a query which allows iterative refinement<br/>
  therefore: design stuff that directly represents a semi-structured and/or structured query and<br/>
  think of how various result-sets may be represented<br/>

* Facilitate _comparison_ of deep information (the "teapot" of UIs for information processing tasks / infoviz-tools)

* Try to achieve something like _reversibility of commands_ on infos (Undo/Redo)<br/>
  e.g. try to implement command pattern . (though this may be just too much of an effort..)

* Design "Workspaces" as explicit (and not necessarily implicit) places in regards to "Maps"

* Provide infrastructure to personalize client-side renderings on per user and domain base<br/>
  in terms of: color-palette active, gui-theme loaded and preferred rendering settings (map, tree)

* Operate with per-user configuration of all presentations settings (color scheme, fonts, shapes, etc.)

* Tiling areas in a map? How would you imagine?<br/>


### Addendum

I am curious and still want to get to know more about the limits of visual sense-making. For example, we know (from studies in 2008 and 2009) that creating manually arranged graph layouts is promising when we do so focussing on designing touch- or pen-based interactions. At least much more promising than focussing on delivering this UI for pointer-based interactions. Nonetheless, this graph aims to be (to some degree) controllable by keyboard interactions, too.

To be able to get there i would like to develop this GUI in a highly connective and collaborative way. I herewith seek for your help in making this possible. Please help to think through some of the details and please think about contributing anything from sketches, requirements or wishes up to code or styles.

Everyone is welcome!

Cheers!

-----------------------------------------
Author: Malte Reißig<br/>
Berlin <-> Leipzig, 2014-2016


