import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Capacitor/Android (safe for client-side apps)
  output: 'export',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,  // ✅ Re-enabled (warnings won't block build)
  },
  typescript: {
    ignoreBuildErrors: false,  // ✅ Fixed: Enable TypeScript error checking
  },
  images: {
    unoptimized: true,
  },
  // Optimize bundle splitting for better performance
  webpack: (config, { isServer }) => {
    // Optimize chunk splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Split vendor code into separate chunks
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Split UI library code
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1]
              return `npm.${packageName?.replace('@', '')}`
            },
            priority: 30,
          },
          // Split common components used across multiple pages
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          // Split shared code
          shared: {
            name: 'shared',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      }
    }
    return config
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Add cache ID to force cache invalidation on new deployments
  cacheId: `bias-daily-v${Date.now()}`,
  // Exclude problematic files from precaching
  exclude: [
    /app-build-manifest\.json$/,
    /build-manifest\.json$/,
    /react-loadable-manifest\.json$/,
    /page_client-reference-manifest\.js$/,
    /_not-found/,
    /server\/app/,
    /middleware-build-manifest\.js$/,
    /middleware-react-loadable-manifest\.js$/,
    /next-font-manifest\.js$/,
    /next-font-manifest\.json$/,
  ],
  runtimeCaching: [
    {
      // API and data routes - Always fetch fresh
      urlPattern: /^https?.*\/(api|data)\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    {
      // Pages and HTML - Network first to get updates
      urlPattern: /^https?.*\.html$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      // JS and CSS - Cache first but with short expiration
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      // Images - Cache first with longer expiration
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Everything else - Network first to always get updates
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
})(nextConfig)
