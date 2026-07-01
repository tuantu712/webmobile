import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    '/api/**/*': ['./database.sqlite'],
  },
};

export default nextConfig;
