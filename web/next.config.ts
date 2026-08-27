import type { NextConfig } from "next";

// The browser always calls same-origin `/api/*`; Next proxies those requests to
// the Express backend. In development that's the local server, otherwise the
// deployed one. On Vercel set PROD_SERVER_URL in the project's env vars.
const serverUrl =
  process.env.ENVIRONMENT === "development"
    ? process.env.DEV_SERVER_URL
    : process.env.PROD_SERVER_URL;

if (!serverUrl) {
  throw new Error(
    "Missing backend URL for the /api proxy. Set PROD_SERVER_URL (or DEV_SERVER_URL when ENVIRONMENT=development) in your environment / Vercel project settings.",
  );
}

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: `${serverUrl}/api/:path*`,
    },
  ],
};

export default nextConfig;
