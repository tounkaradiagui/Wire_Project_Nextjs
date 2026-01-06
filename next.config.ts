import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
      domains: ['res.cloudinary.com'],
      remotePatterns: [
        {hostname: "images.pexels.com"}
      ]
    }
  
};

export default nextConfig;
