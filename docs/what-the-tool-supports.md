
## What this tool currently can and can't do:


 * Loading and selecting your `Topicmaps`
 * Loading and switching between your `Workspaces`
 * Displaying descriptions of your _Notes_ and _Contacts_
 * Starting and stopping an authenticated session at DeepaMehta 4 (`Login` and `Logout`)
 * Multiple selection on nodes in the graph (but moves, evne if logged in, are not saved/persisted yet)
 * Zooming the graph in and out
 * `Hide` and `Show` all _Associations_, all _Item Titles_, all _Hidden Topics_

### Outdated docs

To become an alternate, command-line controllable presentation layer...

Current & former features include:
 * Load a Topicmap via `open <name>`
 * Free placement and panning (allowing to interact with the loaded topic map without persistence)
 * Multiple selection of topics using the `SHIFT` key with (offering event handling for the controller)
 * Zooming in and out of the presented network (graph panel)
 * `hide` and `show assocs` command for toggling the display of all associations
 * `hide` and `show assocs` command for toggling the display of all topics of a certain  _type_ - (not yet implemented)
 * Full text search across the complete databse with selection between all results to reveal/load a hidden topic into the loaded _Topicmap_ - (not yet implemented)

The aim is (as always) that this becomes an easy extendable codebase for developers and that it is maximal customizable for designers.

Writing back and persisting the re-arrangements, as well as writing changes in view configuration for single topics, persisting a more complex view state or being able to create simple note topics is all "future is unknown" stuff.

Ideal, differing from the more general approach of the dm4-webclient, this presentation layer will try to deliver satisfaction for information processing tasks, including (but not limited to):
 * _iterative refinement_ for finding existing topics (or expand on what became known as _faceted browsing_ allowing for combination of parameters/facets),
 * _comparison_ of "details" (just topics for now but later) of elements in your personal graph-like dataset
 * feel of _immediacy_ for users when re-arranging their view should always be maintained

For a more detailed explanation see section "Details on differences" further down.

Similar to the original dm4-webclient module this codebase aims at:
 * DONE - load & edit maps: load stable_views for users of any known dm/x platform (focusing on free placement)
 * presentation & action: let users search, visualize _and_ explore elements of their personal graph-data database
 * DONE - modular architecture: in terms of the JavaScript AMD definition (e.g. requirejs.org)
 * become extendable: allow for JavaScript plugins to take over rendering
 * OK - stay cusomizable: allow designers for as much CSS customizations as possible
 * target bigger-screen devices: no smaller then tablet-sized screens will be targeted

