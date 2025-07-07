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
  // Azure App Service optimization
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  // Skip build-time execution of API routes
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Webpack configuration for Azure Blob Storage
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      // Externalize Azure SDK to prevent build issues
      config.externals = [...(Array.isArray(config.externals) ? config.externals : []), "@azure/storage-blob"];
    }
    return config;
  },
};

export default nextConfig;
