const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
  entry: "./src/index.tsx",
  module: {
    rules: [
      {
        test: /\.ts(x)?$/i,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-typescript",
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    corejs: 3,
                  },
                ],
                "@babel/preset-react",
              ],
              plugins: [
                //add babel plugins
              ],
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.js(x)?$/i,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    corejs: 3,
                  },
                ],
                "@babel/preset-react",
              ],
              plugins: [
                //add babel plugins
              ],
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "public/",
          globOptions: { ignore: ["**/*.html"] },
        },
      ],
    }),

    new HtmlWebpackPlugin({
      template: "public/index.html",
      hash: true,
      minify: false,
    }),
    new MiniCssExtractPlugin({
      filename: "assets/css/[name].css?[contenthash:8]",
      chunkFilename: "assets/css/[name].chunk.css?[contenthash:8]",
    }),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
};

const cssLoader = {
  test: /\.css$/i,
  exclude: /\.module\.css$/i,
  use: ["css-loader"],
};

const moduleCssLoader = {
  test: /\.module\.css$/i,
  use: [
    {
      loader: "css-loader",
      options: {
        modules: true,
      },
    },
  ],
};

module.exports = (env, args) => {
  if (args.mode === "development") {
    config.devtool = "eval-source-map";
    config.devServer = {
      compress: true,
      static: false,
      client: {
        logging: "warn",
        overlay: {
          errors: true,
          warnings: false,
        },
        progress: true,
      },
      port: env.PORT ?? 3000,
      host: env.HOST ?? "0.0.0.0",
    };

    cssLoader.use.unshift("style-loader");
    moduleCssLoader.use.unshift("style-loader");
    config.module.rules.push(moduleCssLoader, cssLoader);
  }
  if (args.mode === "production") {
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: 6,
            compress: { drop_console: true },
            output: { comments: false, beautify: false },
          },
        }),
      ],
    };

    cssLoader.use.unshift(MiniCssExtractPlugin.loader);
    moduleCssLoader.use.unshift(MiniCssExtractPlugin.loader);
    config.module.rules.push(cssLoader, moduleCssLoader);
  }

  return config;
};
