/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    return [
      {
        source: "/api/v1/:path*",
        destination: `${api}/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
