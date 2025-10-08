import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Desactivar verificación de tipos durante el build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Desactivar ESLint durante el build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
