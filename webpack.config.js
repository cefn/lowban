const path = require("path")
const { mode } = require("./server/defaults")

module.exports = {
  mode: mode,
  devtool: "source-map",
  entry: {
    "main": "client/frontend.js"
  },
  output: {
    path: path.join(__dirname, "/static/build/"),
    filename: "frontend.js",
    publicPath: "/static/build/"
  }
  ,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    modules: [__dirname, "node_modules"],
    alias: { //TODO put react profiling and tracing options in debug or development configuration
      "react-dom$": "react-dom/profiling",
      "scheduler/tracing": "scheduler/tracing-profiling",
    }
  }
}