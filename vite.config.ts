import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, type ViteDevServer } from "vite";

const exampleParams =
  "client_id=8f9a0002-ae0f-4412-ac4c-902f1e88e5ff&state=-G2EoDooYcrJ5p8EF1AM677T8BvnSMxQMU4HtUjoQ4Y&redirect_uri=https%3A%2F%2Fzapier.com%2Fdashboard%2Fauth%2Foauth%2Freturn%2FApp222291CLIAPI%2F&response_type=code&scope=conversion&code_challenge=BSupaW6JDyiPDgU4HM8wkLj94DELW0BvsxPAoO2d5XA&code_challenge_method=S256";

const blue = "\x1b[34m";
const reset = "\x1b[0m";
const bold = "\x1b[1m";

const logTestUrlPlugin = () => ({
  name: "log-test-url",
  configureServer(server: ViteDevServer) {
    server.httpServer?.once("listening", () => {
      const baseUrl = "http://localhost:5173/";
      const fullUrl = `${baseUrl}?${exampleParams}`;
      const label = `${bold}${"OAuth: (CMD/Ctrl+Click the url!)".padEnd(7)}${reset}`;

      console.info(`  ➜  ${label} ${blue}${fullUrl}${reset}`);
      console.info();
    });
  },
});

export default defineConfig({
  plugins: [vue(), tailwindcss(), logTestUrlPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
