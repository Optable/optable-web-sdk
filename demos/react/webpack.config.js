const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/identify.tsx",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },

  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".js", ".jsx", ".tsx"],
  },
  plugins: [
    new webpack.DefinePlugin({
      DCN_CONFIG: JSON.stringify({
        host: process.env.DCN_HOST,
        initPassport: process.env.DCN_INIT === "true",
        site: process.env.DCN_SITE,
        node: process.env.DCN_NODE,
        legacyHostCache: process.env.DCN_LEGACY_HOST_CACHE,
      }),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
};
