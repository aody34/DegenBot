/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config) => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
    // Proxy Jupiter API through Vercel's infrastructure
    async rewrites() {
        return [
            {
                source: '/jupiter-api/:path*',
                destination: 'https://quote-api.jup.ag/:path*',
            },
            {
                source: '/jupiter-tokens/:path*',
                destination: 'https://tokens.jup.ag/:path*',
            },
            {
                source: '/jupiter-token-list',
                destination: 'https://token.jup.ag/strict',
            },
        ];
    },
};

module.exports = nextConfig;
