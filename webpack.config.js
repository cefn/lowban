const path = require("path")
const { mode } = require("./defaults")

module.exports = {
  mode: mode,
  devtool: "eval-source-map",
  entry: {
    "main": "index.js"
  },
  output: {
    path: path.join(__dirname, "/static/build/"),
    filename: "index.js",
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
  }
}