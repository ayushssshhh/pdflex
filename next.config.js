const { default: build } = require('next/dist/build')

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config,
        { buildId, dev, isSrever, defaultLoaders, webpack }
    ) => {
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;
        return config
    }
}

module.exports = nextConfig
