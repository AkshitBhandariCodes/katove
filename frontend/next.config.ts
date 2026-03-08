import path from "path";
import type { NextConfig } from "next";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

// Build remote image patterns from the backend API URL so deployed
// frontends can load images served by the backend (e.g. Supabase storage
// proxy URLs).  Falls back to localhost:3001 for local development.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
let apiHost: { protocol: 'http' | 'https'; hostname: string; port: string } | undefined;
try {
  const parsed = new URL(apiUrl);
  apiHost = {
    protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
    hostname: parsed.hostname,
    port: parsed.port,
  };
} catch {
  // keep undefined – no remote pattern added
}

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: configDir,
  },
  images: {
    unoptimized: true,
    remotePatterns: apiHost
      ? [
          {
            protocol: apiHost.protocol,
            hostname: apiHost.hostname,
            ...(apiHost.port ? { port: apiHost.port } : {}),
            pathname: '/**',
          },
        ]
      : [],
  },
};

export default nextConfig;
