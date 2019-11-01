# Personal Development Project

# Summary

An applied software project undertaken during my '10%' time to improve my front end skills.

# Background

Revising GraphQL prompted me to build a minimal front-end for simple structured data. A skills gap emerged when trying to 'knock together' a versioned TODO list or Project catalog, leading to this mini-project to learn more about front-end models and rendering. I am still keen to return to exploring cloud-hosted stream joins and managed search indexes, once this project has been completed.

# Scope

The tool I have built allows **formally-structured data** to be **collaboratively authored** in a **versioned** way. Data having ***formal structure*** means it has to satisfy data schemas or co-constraints. The tool assists with populating the data, and offers a workflow for resolving validation problems in previously authored data. Both the data and its rules are expected to evolve over time. ***Collaborative authoring*** gives a shared view on evolving data, allowing changes to propagate between multiple authors. The data could be hosted centrally, or multiple authors can run the app, adding data to a local copy reconciled later. ***Versioned authoring*** means contributors' changes are trackable. For example, changes to a JSON file on disk can be committed via PRs to github.

A by-product of the decentralised approach is that work can be done offline. Additionally, coordinating the hosting of both app and data through a versioned repo means that collaborators who have software development skills can adapt the data validation rules and the interface to suit their needs.

# Worked Example - Task Management

My first target was a 'Todo' application, with minimal definition of Tasks having a title, notes and tags, and a workflow for editing and listing tasks for completion. Versioning via github provides for offline use on multiple different devices, as well as explicit visibility and trackability of changing notes and completed tasks. It is loosely based on the 'Getting Things Done' productivity system from David Allen. Data is a bipartite graph of 'data nodes' - interconnected Tasks and Tags. Tasks include Tag ids in a quick-to-edit space-separated field. Ad-hoc tags can be created by just typing an id. Long-lived, purpose-specific Tags have additional metadata e.g. title or notes.

Tasks can be ordered, filtered by their Tags, each Tag type begins with a different character.

* !Priority of the task (!urgent !soon '' !backlog !wishlist)
* @Context where the task can be done (@home @work @shop @car @internet @workshop)
* #Status to manage workflow (#Wait #Ref #WontDo #Expedite)
* ~Schedule when tasks become (re)actionable (~daily ~weekly ~'fridays' ~'next thursday')
* |Deadline when tasks must be done (|friday |'December 21st')
* Category to annotate tasks (freetext tag with no prefix)

Tasks can be filtered by context (e.g. those which can be done right now). They can be ordered by the !Priority tag, task age, its schedule or deadline. For human-readable schedule and deadline Tags I forked an unmaintained time parsing library, added minor improvements and republished at npm as [fix-time](https://www.npmjs.com/package/fix-time).

The expressivity of task data and backlog ordering are expected to evolve over time.

# Core Technology

The data store is based on [lowdb](https://github.com/typicode/lowdb). Lowdb provides a database-like view on a JSON data file  (see e.g. [this blog post](https://helpdev.eu/node-js-lowdb-a-lightweight-database-alternative/)). The JSON is committed into github to share locally-authored changes to other devices. This 'NoSQL' data store, was wrapped with a restricted Javascript API so in the future the same API could be provided by a cloud-hosted store.

I authored a 'model' for inspecting and manipulate objects and lists returned by the store, mapping to Tasks and Task actions, Tags and Tag types. This defined task orderings, task actionability (e.g. actionable date passed and not fulfilled) and so on. The object store and tag model have extensive testing with > 90% coverage. GraphQL data resolvers connect the browser-based user interface to the Task-modelled data in the store. Different filters and orderings for Task and Tag data are parameterised GraphQL queries.

Finally, React was adopted for the viewing and editing of data loaded through GraphQL. This was facilitated by React-JSONSchema-Form as a schema-oriented editing component.

# Client-side Modelling and Sagas

I adopted the recent React paradigm of Functional Components with Hooks. The aim was to make the UI a minimal component, with business logic all defined server-side and a handful of pathways for data to be exchanged between client and server e.g. : 

* Specify the focused record by id, or blank for a new record 
* Retrieve remote record to local record when first loading an id
* Update local record data when data is edited in a HTML form
* Save local record data to the remote record when it has changed
* Update local records when data changes server-side, for example
  - when a new row is assigned an id on save to the store
  - when server-logic rewrites e.g. human readable time to strict date stamps
  - when server-logic updates a task with an 'action'
* Update lists of rows 
  - when a local change is saved
  - when a task-ordering configuration is changed

Implementing and debugging even these simple asynchronous pathways as part of React's forward-rendering became rapidly unmanageable. Trying to rely on React's state management to know when to re-run routines was unpredictable. React eagerly re-runs routines because of a change in references (not a change in data). This frequently led to data updates lost or infinite loops of events bouncing around between the front and back end.

React Hooks are intended to make component state explicit and maintainable without state-handling code spread across the lifecycle methods of React classes. However, I found hooks to be a brittle and unconventional use of the Javascript language, rife with bugs around dynamic component state. React developers manage this complexity by aggressive eslint rules. These unfortunately create (arguably worse) bugs by rewriting your code [see e.g. this bug report](https://github.com/facebook/react/issues/16941). Given the infinite loops created by React's useEffect() hook the application was already of a complexity that a full-blown application state manager would be needed. 

To explore alternative architectures I simplified the row-editing application and experimented with the use of Redux on its own and alongside Redux-Thunk, I finally settled on Redux-Saga as a framework for management of async state around a Redux Store through long-lived orchestrations called Sagas.

I have now explored building the same minimal row-editing app with the above pathways in React+Hooks, React+Redux, React+Redux-Thunk and React+Redux-Saga. I feel I have bottomed out the state management issues properly in the Redux+Thunk case and I am in the process of incorporating the proven React-Saga approach back into the main project.

# The Saga Continues