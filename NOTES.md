Will probably use...

- react-jsonschema-form for Forms-based editing https://github.com/mozilla-services/react-jsonschema-form
  - minimal-react for creating basic skeleton (doesn't import react-scripts or introduce npm checks like create-react-app does)
- webpack for client-side javascript transpiling and bundling
  - webpack dev server potentially for testing standalone React components?
- react-engine for server-side templating
  - potential for client-side mounting of server-side rendered templates using https://www.npmjs.com/package/memory-fs

## Development targets

1. Create mutation and prove saving of data to lowdb
2. Consider how to template around React components - Next.js, Platelet, EJS, react-engine, something else.
3. If not Next.js Establish webpack bundling workflow to generate client-side scripts with hot-module-replacement support
4. Add a Markdown-highlighting editor panel for 'note' field, e.g. based on HighlightJS (simpler) or PrismJS (e.g. CodeFlask)
