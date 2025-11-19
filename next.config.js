const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  experimental: {
    optimizePackageImports: [
      'react', 
      'react-dom', 
      'lucide-react', 
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@livekit/components-react',
      'date-fns',
    ],
    optimizeCss: true, // Enable CSS optimization
  },

  // ESLint configuration
  // TODO: Remove ignoreDuringBuilds after fixing critical ESLint errors
  // Step 1: Fix critical ESLint errors first
  // Step 2: Remove ignoreDuringBuilds: true
  // Step 3: Fix remaining ESLint warnings
  eslint: {
    // Temporarily keep ignoreDuringBuilds until critical errors are fixed
    // Set to false after fixing: duplicate function implementations, unused imports, etc.
    ignoreDuringBuilds: true, // TODO: Change to false after fixing critical errors
  },
  
  // TypeScript configuration
  // TODO: Remove ignoreBuildErrors after fixing critical TypeScript errors
  // Step 1: Fix critical TypeScript errors (type mismatches, missing properties, etc.)
  // Step 2: Remove ignoreBuildErrors: true
  // Step 3: Fix remaining TypeScript warnings
  typescript: {
    // Temporarily keep ignoreBuildErrors until critical errors are fixed
    // Set to false after fixing: ~500+ TypeScript errors including:
    // - Type mismatches (TS2322)
    // - Missing properties (TS2339)
    // - Unused variables (TS6133)
    // - Duplicate implementations (TS2393)
    ignoreBuildErrors: true, // TODO: Change to false after fixing critical errors
  },

  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,

  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      'staging-backend.render.com',
      'backend.render.com',
      's3.wasabisys.com',
      's3.eu-central-1.wasabisys.com',
    ],
    formats: ['image/webp', 'image/avif'],
    // Enable image optimization for better performance
    // Note: For external images (Wasabi), we use proxy routes
    unoptimized: false,
    // Add remote patterns for Wasabi images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wasabisys.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'staging-backend.render.com',
      },
      {
        protocol: 'https',
        hostname: 'backend.render.com',
      },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_API_URL_LOCAL: process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api',
    NEXT_PUBLIC_API_URL_STAGING: process.env.NEXT_PUBLIC_API_URL_STAGING || 'https://staging-backend.render.com/api',
    NEXT_PUBLIC_API_URL_PRODUCTION: process.env.NEXT_PUBLIC_API_URL_PRODUCTION || 'https://lisan-alhekma.onrender.com/api',
  },

  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: '/api/proxy/:path*',
      },
      // Remove this rule as it conflicts with local API routes like image-proxy
      // {
      //   source: '/api/:path*',
      //   destination: `${
      //     process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      //   }/:path*`,
      // },
    ];
  },

  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
    localeDetection: false,
  },

  optimizeFonts: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Language', value: 'ar' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // Remove COEP for better performance (causes issues with some third-party scripts)
          // { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          // Add caching headers for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },

  webpack: (config) => {

    config.module.rules.push({
      test: /\.mjs$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    });

    config.ignoreWarnings = [
      /Failed to parse source map/,
      /vision_bundle_mjs\.js\.map/,
      /removeChild/,
      /NotFoundError/,
      /Failed to execute 'removeChild'/,
      /React does not recognize the.*prop on a DOM element/,
      /Warning:.*is not a valid DOM property/,
      /commitDeletionEffectsOnFiber/,
      /commitMutationEffectsOnFiber/,
      /recursivelyTraverseMutationEffects/,
      /commitDeletionEffects/,
      /commitRootImpl/,
      /performSyncWorkOnRoot/,
      /flushSyncWorkAcrossRoots/,
      /processRootScheduleInMicrotask/,
      /redirect-boundary\.js/,
      /not-found-boundary\.js/,
      /react-dom\.development\.js/,
    ];

    // Production optimizations
    if (config.mode === 'production') {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // React and React-DOM
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Radix UI components
            radix: {
              name: 'radix',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              priority: 30,
              enforce: true,
            },
            // LiveKit components (heavy library)
            livekit: {
              name: 'livekit',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@livekit|livekit-client|livekit-server-sdk)[\\/]/,
              priority: 35,
              enforce: true,
            },
            // Framer Motion
            framerMotion: {
              name: 'framer-motion',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 30,
              enforce: true,
            },
            // H5P and other heavy libraries
            heavyLibraries: {
              name: 'heavy-libs',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](h5p-standalone|hls\.js|canvas-confetti)[\\/]/,
              priority: 25,
              enforce: true,
            },
            // Vendor libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              minChunks: 2,
            },
          },
        },
        minimize: true,
        concatenateModules: true,
        usedExports: true,
        sideEffects: false,
      };
    }

    // Development optimizations
    if (config.mode === 'development') {
      config.stats = { warnings: false, errors: true };
      config.infrastructureLogging = { level: 'error' };
      config.performance = { hints: false };

      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 40,
              enforce: true,
            },
            reactRelated: {
              name: 'react-related',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|@types|scheduler)[\\/]/,
              priority: 35,
              enforce: true,
            },
          },
        },
        minimize: false,
        concatenateModules: false,
        sideEffects: false,
      };

      config.plugins = config.plugins || [];
      config.plugins.push(
        new (require('webpack').DefinePlugin)({
          'process.env.NODE_ENV': JSON.stringify('development'),
          '__DEV__': true,
        })
      );
    }

    return config;
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    styledComponents: true,
  },

  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

module.exports = withBundleAnalyzer(nextConfig);