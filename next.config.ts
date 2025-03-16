import type { NextConfig } from "next";
import pkg from "./package.json";

const API_PROXY_BASE_URL = process.env.API_PROXY_BASE_URL as string;
const GOOGLE_GENERATIVE_AI_API_KEY = process.env
  .GOOGLE_GENERATIVE_AI_API_KEY as string;
const BUILD_MODE = process.env.NEXT_PUBLIC_BUILD_MODE;

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    reactCompiler: true,
  },
  env: {
    NEXT_PUBLIC_VERSION: pkg.version,
  },
  rewrites: async () => {
    return [
      {
        source: "/api/ai/google/v1beta/:path*",
        has: [
          {
            type: "header",
            key: "x-goog-api-key",
            value: "(?<key>.*)",
          },
        ],
        destination: `${
          API_PROXY_BASE_URL || "https://generativelanguage.googleapis.com"
        }/v1beta/:path*?key=${GOOGLE_GENERATIVE_AI_API_KEY}`,
      },
    ];
  },
};

if (BUILD_MODE === "export") {
  nextConfig.output = "export";
  // Only used for static deployment, the default deployment directory is the root directory
  nextConfig.basePath = "";
} else if (BUILD_MODE === "standalone") {
  nextConfig.output = "standalone";
}

export default nextConfig;
