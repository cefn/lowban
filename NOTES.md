## Development targets

### Milestones

* Priority list orders by priority
* Due list orders by due
* Next list orders by both priority and due

Create a bootstrap-based layout for the components. Strategy for panes and their navigation behaviours:

* Nav
    - New button
* Context based routing logic
    - Path filter
        - updates context path below only if path matches
        - 
* Edit pane showing either Task or Tag
    - task menu 
        - next control - pulls task from position after this in next list
        - done control - adds #done, then pulls task from same position in next list (since the old one will be gone)
    - autocomplete for tagIds field
* 'Tag' pane
    - narrow, central view lists tags below and controls Task list pane to right 
    - search box for filtering, with autocomplete
    - Tabbed tags (All, Categories, Contexts, Priorities hoisted (in priority order), Statuses
    - Colors for status types?
* Task list pane
    - further filter on label and note content (with regexp)
    - tabbed (next task) (filtered tasks)
    - detail levels? e.g. label only, label+note, label+note+tags

Keyboard shortcuts:
    * Navigation between panes in edit (e.g. SHIFT+ALT+L label, SHIFT+ALT+N notes, SHIFT+ALT+T tags)




1. Add a Markdown-highlighting editor panel for 'note' field, e.g. based on HighlightJS (simpler) or PrismJS (e.g. CodeFlask)

