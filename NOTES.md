Will probably use...

- react-jsonschema-form for Forms-based editing https://github.com/mozilla-services/react-jsonschema-form
  - minimal-react for creating basic skeleton (doesn't import react-scripts or introduce npm checks like create-react-app does)
- webpack for client-side javascript transpiling and bundling
  - webpack dev server potentially for testing standalone React components?
- react-engine for server-side templating
  - potential for client-side mounting of server-side rendered templates

## Development targets

1. Create route listing data from database in server-side-rendered template
2. Create route loading react-jsonschema-form client-side editor allowing editing and saving of new entries
3.
4. Establish webpack bundling workflow to generate client-side scripts with hot-module-replacement support
5. Incorporate React in server-side rendering (by using react-engine or extending EJS macros)
6.
