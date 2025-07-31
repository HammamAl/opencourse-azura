import { NextConfig } from "next";
import { Configuration } from "webpack";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pindahkan @azure/storage-blob ke serverExternalPackages
  serverExternalPackages: ["argon2", "@azure/storage-blob"],
  // Hapus experimental.serverComponentsExternalPackages yang deprecated
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
        hostname: "*.blob.core.windows.net",
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
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
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
      // Tambahkan externals untuk Azure Storage Blob
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        {
          "@azure/storage-blob": "commonjs @azure/storage-blob",
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
