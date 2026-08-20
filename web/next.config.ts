import type { NextConfig } from "next";

const serverUrl =
  process.env.ENVIRONMENT === "development"
    ? process.env.DEV_SERVER_URL
    : process.env.PROD_SERVER_URL;

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: `${serverUrl}/api/:path*`,
    },
  ],
};

export default nextConfig;
