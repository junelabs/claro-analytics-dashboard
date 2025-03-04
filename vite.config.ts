
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ConfigEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/tracker.js': 'http://localhost:8080',
      '/api/track': 'http://localhost:8080'
    },
    // This enables proper handling of client-side routing in dev
    historyApiFallback: {
      disableDotRule: true,
      index: '/'
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
