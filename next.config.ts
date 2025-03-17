import type { NextConfig } from "next";
import pkg from "./package.json";

const BUILD_MODE = process.env.NEXT_PUBLIC_BUILD_MODE;

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    reactCompiler: true,
  },
  env: {
    NEXT_PUBLIC_VERSION: pkg.version,
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
