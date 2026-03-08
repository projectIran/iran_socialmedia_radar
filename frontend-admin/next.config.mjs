/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const adminApi = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3002"
    const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    return [
      {
        source: "/api/v1/admin/:path*",
        destination: `${adminApi}/v1/admin/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${publicApi}/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
