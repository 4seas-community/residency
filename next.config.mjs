import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = dirname(fileURLToPath(import.meta.url))
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
}

export default nextConfig
