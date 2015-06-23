
### Codename: stableviews ui

An alternate, command-line controllable presentation layer for _Topicmaps_ authored with DeepaMehta 4.

Features include:
 * Load a Topicmap via `open <name>`
 * Free placement and panning (allowing to interact with the loaded topic map without persistence)
 * Full text search across the complete databse with selection between all results to reveal/load a hidden topic into the loaded _Topicmap_ - (not yet implemented)
 * Hide and show command for a) all associations and b) for each _type_ - (not yet implemented)

The aim is (as always) that this becomes an easy extendable codebase for developers and that it is maximal customizable for designers.

Writing back and persisting the re-arrangements, as well as writing changes in view configuration for single topics, persisting a more complex view state or being able to create simple note topics is all "future is unknown" stuff.

Ideal, differing from the more general approach of the dm4-webclient, this presentation layer will try to deliver satisfaction for information processing tasks, including (but not limited to):
 * _iterative refinement_ for finding existing topics (or expand on what became known as _faceted browsing_ allowing for combination of parameters/facets),
 * _comparison_ of "details" (just topics for now but later) of elements in your personal graph-like dataset
 * feel of _immediacy_ for users when re-arranging their view should always be maintained

For a more detailed explanation see section "Details on differences" further down.

Similar to the original dm4-webclient module this codebase aims at:
 * load & edit maps: load stable_views for users of any known dm/x platform (focusing on free placement)
 * presentation & action: let users search, visualize _and_ explore elements of their personal graph-data database
 * modular architecture: in terms of the JavaScript AMD definition (e.g. requirejs.org)
 * become extendable: allow for JavaScript plugins to take over rendering
 * stay cusomizable: allow designers for as much CSS customizations as possible
 * target bigger-screen devices: no smaller then tablet-sized screens will be targeted


### Inspiration

The _Topicmaps UI_ by Jörg Richter (@jri).

With this interface we draw upon the knowledge on humans  _visual_ and _spatial memory_. Furthermore we think that an item "is" or "is best described" through the relations to other items, its relation it is "seen" (or understood) in. To be able do meaningful research with this cognitive tool we believe that this user interface needs to allow users of _free placement_ and needs to provide _stable geometries_.


### Challenges

At best, we are able to address the following, more general challenges for such UI:

 * comparison: e.g. allow to compare details of any two given topics
 * multi select: allow to select and trigger commands on a set of elements
 * query-ui: allow for iterative refinement of "Search Results", e.g. in forms of "Search Buckets"
 * command line: text based interaction to control the ui (search and reveal topics in maps, filter in maps, search and load maps, "mail jri")
 * themes: allow to switch between many CSS definitions
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

### Installation

After cloning, packaging and installing this DeepaMehta 4 bundle you need to browse `/de.mikromedia.stableviews` on your DeepaMehta 4 installation to start loading your existing topicmaps into this interface via the `open <Nr>`-commands.

### Addendum

I am curious and still want to get to know more about the limits of visual sense-making. To be able to get there i would like to develop this GUI in a highly connective and collaborative way. I herewith seek for your help in making this possible. Please help to think through some of the details and please think about contributing anything from sketches, requirements or wishes up to code or styles.

Everyone is welcome!

#####################
Berlin, November 2014

