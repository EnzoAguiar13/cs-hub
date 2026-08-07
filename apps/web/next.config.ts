import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @cs-hub/shared-types ships plain .ts source (no build step), so Next needs to
  // transpile it itself instead of treating it as pre-built.
  transpilePackages: ["@cs-hub/shared-types"],
};

export default nextConfig;
