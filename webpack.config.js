var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    module: {
        loaders: [
            { test: /\.css$/, loader: ExtractTextPlugin.extract({
                fallbackLoader: "style-loader",
                loader: "css-loader"
            }) }
        ]
    },
    plugins: [
        new ExtractTextPlugin("styles.css")
    ]
};

module.exports = {
    entry: "./src/getData.js",
    output: {
        path: __dirname + '/app/public/index/',
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.scss$/, loader: "style!css!sass" }
        ]
    }
};