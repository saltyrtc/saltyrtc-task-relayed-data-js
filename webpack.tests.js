const merge = require('webpack-merge');
const dev = require('./webpack.dev.js');

module.exports = merge(dev, {
    entry: './tests/main.ts',
    output: {
        filename: 'testsuite.js',
    }
});
