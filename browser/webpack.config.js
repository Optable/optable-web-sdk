const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: {
    sdk: path.resolve(__dirname, "sdk.ts"),
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/env",
                {
                  useBuiltIns: "entry",
                  targets: "> 0.25%, not dead",
                  corejs: 3,
                },
              ],
              [
                "@babel/typescript",
                {
                  onlyRemoveTypeImports: true,
                  allowDeclareFields: true,
                },
              ],
            ],
            plugins: [
              ["@babel/plugin-transform-runtime", { regenerator: true }],
              ["@babel/plugin-proposal-class-properties"],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  plugins: [
    new webpack.DefinePlugin({
      OPTABLE_SANDBOX: JSON.stringify({
        host: process.env.SANDBOX_HOST,
        site: process.env.SANDBOX_SITE,
        insecure: process.env.SANDBOX_INSECURE === "true",
      }),
    }),
  ],
};
