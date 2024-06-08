import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env.API_URL": JSON.stringify(env.API_URL),
      "process.env.CLIENT_ID": JSON.stringify(env.CLIENT_ID),
      "process.env.CLIENT_SECRET": JSON.stringify(env.CLIENT_SECRET),
    },
    plugins: [react()],
    server: {
      port: 3001,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  };
});
