/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/residency',
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
