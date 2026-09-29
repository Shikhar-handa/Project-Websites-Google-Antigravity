import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // The monorepo root has node_modules; CraveBite is a sub-project.
    // Set root to parent so Turbopack can resolve next/package.json.
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
