const webpack = require('webpack');

module.exports = {
  lintOnSave: false,
  devServer: {
    open: true,
  },
  publicPath: './',
  chainWebpack: (config) => {
    // GraphQL Loader
    config.module
      .rule('graphql')
      .test(/\.(graphql|gql)$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end();
  },
  configureWebpack: {
    plugins: [
      new webpack.LoaderOptionsPlugin({
        // test: /\.xxx$/, // may apply this only for some modules
        options: {
          loaders: [{
            test: /\.(graphql|gql)$/,
            exclude: /node_modules/,
            loader: 'graphql-tag/loader',
          },
          {
            test: /\.(png)$/,
            loader: 'url-loader',
            options: {
              esModule: false,
            },
          },
          ],
        },
      }),
    ],
  },
};
