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
      SANDBOX_CONFIG: JSON.stringify({
        host: process.env.SANDBOX_HOST,
        initPassport: process.env.SANDBOX_INIT === "true",
        site: "web-sdk-demo",
        insecure: process.env.SANDBOX_INSECURE === "true",
      }),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
};
