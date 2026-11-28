import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The app lives at the root now. Old /dashboard links keep working, query string included.
    return [{ source: "/dashboard", destination: "/", permanent: true }];
  },
};

export default nextConfig;
