/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Capacitor/Android (safe for client-side apps)
  output: 'export',
  // Disable StrictMode for Android builds to prevent double renders that cause flickering
  // StrictMode intentionally double-renders components in development, which causes visible flicker on Android
  reactStrictMode: false,
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
              // Try to extract package name from module context
              const match = module.context?.match(
                /[\\/]node_modules[\\/](@[^/]+[\\/])?([^/]+)/
              )
              
              if (match) {
                const scoped = match[1] ? match[1].replace(/[@\\/]/g, '') : ''
                const packageName = match[2] || ''
                const fullName = scoped ? `${scoped}-${packageName}` : packageName
                
                if (fullName) {
                  return `npm.${fullName}`
                }
              }
              
              // Fallback: use a hash of the resource path or generic name
              const resource = module.resource || module.identifier?.() || ''
              if (resource) {
                // Create a simple hash from the resource path
                const hash = resource
                  .split('')
                  .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
                  .toString(36)
                  .slice(-8)
                return `npm.${hash}`
              }
              
              // Final fallback
              return 'npm.vendor'
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

export default nextConfig
