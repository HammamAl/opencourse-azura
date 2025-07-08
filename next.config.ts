import { NextConfig } from "next";
import { Configuration } from "webpack";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@azure/storage-blob"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mmrisk.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hammamal.live",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.hammamal.live",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // IMPORTANT: Remove trailing slash for Azure deployment
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  // Add proper redirects to handle any existing trailing slash URLs
  async redirects() {
    return [
      {
        source: "/login/",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/register/",
        destination: "/register",
        permanent: true,
      },
      {
        source: "/dash/",
        destination: "/dash",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals = [...(Array.isArray(config.externals) ? config.externals : []), "@azure/storage-blob"];
    }
    return config;
  },
};

export default nextConfig;
