// vite.config.ts
import { defineConfig } from "file:///D:/trendstudio/app-8mth6gdsxz40/node_modules/vite/dist/node/index.js";
import react from "file:///D:/trendstudio/app-8mth6gdsxz40/node_modules/@vitejs/plugin-react/dist/index.js";
import svgr from "file:///D:/trendstudio/app-8mth6gdsxz40/node_modules/vite-plugin-svgr/dist/index.js";
import path from "path";
import { miaodaDevPlugin } from "file:///D:/trendstudio/app-8mth6gdsxz40/node_modules/miaoda-sc-plugin/dist/index.js";
var __vite_injected_original_dirname = "D:\\trendstudio\\app-8mth6gdsxz40";
var vite_config_default = defineConfig({
  plugins: [react(), svgr({
    svgrOptions: {
      icon: true,
      exportType: "named",
      namedExport: "ReactComponent"
    }
  }), miaodaDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx0cmVuZHN0dWRpb1xcXFxhcHAtOG10aDZnZHN4ejQwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx0cmVuZHN0dWRpb1xcXFxhcHAtOG10aDZnZHN4ejQwXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi90cmVuZHN0dWRpby9hcHAtOG10aDZnZHN4ejQwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHN2Z3IgZnJvbSAndml0ZS1wbHVnaW4tc3Zncic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHsgbWlhb2RhRGV2UGx1Z2luIH0gZnJvbSBcIm1pYW9kYS1zYy1wbHVnaW5cIjtcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgc3Zncih7XG4gICAgICBzdmdyT3B0aW9uczoge1xuICAgICAgICBpY29uOiB0cnVlLCBleHBvcnRUeXBlOiAnbmFtZWQnLCBuYW1lZEV4cG9ydDogJ1JlYWN0Q29tcG9uZW50JywgfSwgfSksIG1pYW9kYURldlBsdWdpbigpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVIsU0FBUyxvQkFBb0I7QUFDbFQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFVBQVU7QUFFakIsU0FBUyx1QkFBdUI7QUFMaEMsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLO0FBQUEsSUFDcEIsYUFBYTtBQUFBLE1BQ1gsTUFBTTtBQUFBLE1BQU0sWUFBWTtBQUFBLE1BQVMsYUFBYTtBQUFBLElBQWtCO0FBQUEsRUFBRyxDQUFDLEdBQUcsZ0JBQWdCLENBQUM7QUFBQSxFQUM5RixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
