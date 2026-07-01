import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./database.sqlite'],
    },
  },
};

export default nextConfig;
