import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/** Production default — override with VITE_SITE_URL in CI or .env */
const SITE_URL = (process.env.VITE_SITE_URL ?? "https://debiasdaily.com").replace(
  /\/+$/,
  "",
);

/** Inject absolute SEO / Open Graph URLs at build time. */
function htmlSeoPlugin() {
  return {
    name: "html-seo",
    transformIndexHtml(html: string) {
      return html.replaceAll("__SITE_URL__", SITE_URL);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), htmlSeoPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
});
