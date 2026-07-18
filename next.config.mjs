import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = dirname(fileURLToPath(import.meta.url))
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  turbopack: {
    root: projectRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    const redirects = [
      {
        source: "/apply",
        destination: "/crypto/apply",
        permanent: false,
      },
    ]

    if (!basePath) return redirects

    return [
      ...redirects,
      {
        source: `${basePath}/:path*`,
        destination: "/:path*",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
