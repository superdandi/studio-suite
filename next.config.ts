import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/studio-suite",
  images: { unoptimized: true },
};

export default nextConfig;
