import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "purecatamphetamine.github.io",
        pathname: "/country-flag-icons/**",
      },
    ],
  },
};

export default nextConfig;
