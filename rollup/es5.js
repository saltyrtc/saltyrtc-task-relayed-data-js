import config from './es2015.js';
import babel from 'rollup-plugin-babel';

config.output.file = 'dist/saltyrtc-task-relayed-data.es5.js';
config.output.format = 'iife';
config.output.name = 'saltyrtcTaskRelayedData';
config.output.strict = true;
config.output.globals = {
    'tweetnacl': 'nacl',
    '@saltyrtc/client': 'saltyrtcClient',
};
config.plugins.push(
    babel({
        babelrc: false,
        exclude: 'node_modules/**',
        externalHelpers: true,
        presets: [
            ['@babel/preset-env', {
                modules: false,
                forceAllTransforms: true,
            }]
        ],
    })
);

export default config;
