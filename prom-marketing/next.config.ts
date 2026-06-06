import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Самостоятелна статична страница (Велко) — обслужва се от public/velko/index.html.
      // Скоупната само за /velko; не засяга нито един app/CRM маршрут.
      { source: "/velko", destination: "/velko/index.html" },
    ];
  },
};

export default nextConfig;
