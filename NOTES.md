## Development targets

### Refactor TODO

Change row to item throughout (items are nested - not table rows)
Normalise tags into single tag schema file like action.schema.json

### Statuses

Possible statuses which would cause items to be hidden from 'next' view, but be visible in a tab of their own

#Wait
#Ref
#Done
#Trash
#Maybe

### Milestones

Allow editing of tags
Provide routing model
Next task control (beside new task)
    - autocomplete for tagIds field
Tag ordering by priority, t-shirt sizes
Support for t-shirt sizes
Regexp support for searching
Add more detail to item views (actionable date, tags ?)
Keyboard shortcuts:
    * Navigation between panes in edit (e.g. SHIFT+ALT+L label, SHIFT+ALT+N notes, SHIFT+ALT+T tags)

Order tags with non-alphanumeric prefixes first

# Notes from Olga

How you might sort tasks

* deadlines first
* shortness of task
* most diverse compared to recently completed
* things that are for others
* giving tasks an estimated time
* telling system how much time you have


1. Add a Markdown-highlighting editor panel for 'note' field, e.g. based on HighlightJS (simpler) or PrismJS (e.g. CodeFlask)
