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