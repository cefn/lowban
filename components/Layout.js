import React from "react"

//Not currently used - need to serialise this with a doctype prefix in the place of bringing in index.html from file
export default function Layout() {
  return <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    </head>
    <body>
      <div id="app"></div>
      <script src="/build/index.js"></script>
    </body>
  </html>
}