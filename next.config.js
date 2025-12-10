import path from 'node:path'
import { fileURLToPath } from 'node:url'

import bundleAnalyzer from '@next/bundle-analyzer'
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";


/*

This config is doing 4 things:

1. Enable bundle analysis optionally
2. Configure Next.js image optimization for specific hosts
3. Patch webpack liases to avoid react duplication issues
4. transpile specific packages that ship untranspiled code

*/


const withBundleAnalyzer = bundleAnalyzer({
  // eslint-disable-next-line no-process-env
  enabled: process.env.ANALYZE === 'true'
})

export default withBundleAnalyzer({

  staticPageGenerationTimeout: 300,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'www.notion.so' },
      { protocol: 'https', hostname: 'notion.so' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'abs.twimg.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 's3.us-west-2.amazonaws.com' }
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  webpack: (config) => {
    const dirname = path.dirname(fileURLToPath(import.meta.url))
    config.resolve.alias.react = path.resolve(dirname, 'node_modules/react')
    config.resolve.alias['react-dom'] = path.resolve(
      dirname,
      'node_modules/react-dom'
    )
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // Ignore 'fs' in the Edge Runtime
    };
    return config
  },

  transpilePackages: ['react-tweet']
})

const nextConfig = {
  experimental: {
    runtime: 'experimental-edge',
  },
  serverExternalPackages: ['ofetch'],
  reactStrictMode: true,
  swcMinify: true,
}
initOpenNextCloudflareForDev();

export { nextConfig };