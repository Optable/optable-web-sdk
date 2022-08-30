const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/identifyAndTargeting.js",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },

  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
};
