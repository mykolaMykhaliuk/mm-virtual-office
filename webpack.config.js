const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.ts",
    output: {
      filename: isProduction ? "[name].[contenthash].js" : "[name].js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".js"],
      alias: {
        "@core": path.resolve(__dirname, "src/core"),
        "@environment": path.resolve(__dirname, "src/environment"),
        "@player": path.resolve(__dirname, "src/player"),
        "@npc": path.resolve(__dirname, "src/npc"),
        "@dialogue": path.resolve(__dirname, "src/dialogue"),
        "@input": path.resolve(__dirname, "src/input"),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        title: "Virtual My Office",
      }),
    ],
    devServer: {
      static: {
        directory: path.resolve(__dirname, "public"),
      },
      hot: true,
      port: 3000,
      open: true,
    },
    devtool: isProduction ? "source-map" : "eval-source-map",
    performance: {
      hints: isProduction ? "warning" : false,
      maxAssetSize: 5_000_000,
      maxEntrypointSize: 5_000_000,
    },
  };
};
