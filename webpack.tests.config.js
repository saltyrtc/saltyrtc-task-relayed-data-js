const path = require('path');

module.exports = {
    entry: './tests/main.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'testsuite.js',
        path: path.resolve(__dirname, 'tests')
    }
};
