import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src/app', 'src/components', 'src/contexts', 'src/lib'],
  },
};

export default nextConfig;
