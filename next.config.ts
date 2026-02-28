import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "**.amazonaws.com", pathname: "/**" },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
