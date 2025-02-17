// vite.config.js
import { defineConfig } from "file:///E:/mojian-blog/blog-web/node_modules/vite/dist/node/index.js";
import vue2 from "file:///E:/mojian-blog/blog-web/node_modules/@vitejs/plugin-vue2/dist/index.mjs";
import path from "path";
import { loadEnv } from "file:///E:/mojian-blog/blog-web/node_modules/vite/dist/node/index.js";
import { createSvgIconsPlugin } from "file:///E:/mojian-blog/blog-web/node_modules/vite-plugin-svg-icons/dist/index.mjs";
var __vite_injected_original_dirname = "E:\\mojian-blog\\blog-web";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    server: {
      // 允许IP访问
      host: "0.0.0.0",
      // 应用端口 (默认:3000)
      port: Number(env.VITE_APP_PORT),
      // 运行是否自动打开浏览器
      open: false,
      proxy: {
        /** 代理前缀为 /dev-api 的请求  */
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          // 接口地址
          target: env.VITE_APP_API_URL,
          rewrite: (path2) => path2.replace(new RegExp("^" + env.VITE_APP_BASE_API), "")
        }
      }
    },
    plugins: [
      vue2(),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]"
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
                  @import "@/styles/variables.scss";
                  @import "@/styles/mixins.scss";
                  @import "@/styles/global.scss";
                  @import "@/styles/elmentui.scss";
                `
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxtb2ppYW4tYmxvZ1xcXFxibG9nLXdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcbW9qaWFuLWJsb2dcXFxcYmxvZy13ZWJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L21vamlhbi1ibG9nL2Jsb2ctd2ViL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZTIgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlMidcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHsgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tc3ZnLWljb25zJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xyXG5cclxuICAgIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNlcnZlcjoge1xyXG4gICAgICAgICAgICAvLyBcdTUxNDFcdThCQjhJUFx1OEJCRlx1OTVFRVxyXG4gICAgICAgICAgICBob3N0OiBcIjAuMC4wLjBcIixcclxuICAgICAgICAgICAgLy8gXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzIChcdTlFRDhcdThCQTQ6MzAwMClcclxuICAgICAgICAgICAgcG9ydDogTnVtYmVyKGVudi5WSVRFX0FQUF9QT1JUKSxcclxuICAgICAgICAgICAgLy8gXHU4RkQwXHU4ODRDXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU2MjUzXHU1RjAwXHU2RDRGXHU4OUM4XHU1NjY4XHJcbiAgICAgICAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICAgIC8qKiBcdTRFRTNcdTc0MDZcdTUyNERcdTdGMDBcdTRFM0EgL2Rldi1hcGkgXHU3Njg0XHU4QkY3XHU2QzQyICAqL1xyXG4gICAgICAgICAgICAgIFtlbnYuVklURV9BUFBfQkFTRV9BUEldOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAvLyBcdTYzQTVcdTUzRTNcdTU3MzBcdTU3NDBcclxuICAgICAgICAgICAgICAgIHRhcmdldDogZW52LlZJVEVfQVBQX0FQSV9VUkwsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT5cclxuICAgICAgICAgICAgICAgICAgcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoXCJeXCIgKyBlbnYuVklURV9BUFBfQkFTRV9BUEkpLCBcIlwiKSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICAgdnVlMigpLFxyXG4gICAgICAgICAgY3JlYXRlU3ZnSWNvbnNQbHVnaW4oe1xyXG4gICAgICAgICAgICAvLyBcdTYzMDdcdTVCOUFcdTk3MDBcdTg5ODFcdTdGMTNcdTVCNThcdTc2ODRcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTU5MzlcclxuICAgICAgICAgICAgaWNvbkRpcnM6IFtwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9hc3NldHMvaWNvbnMnKV0sXHJcbiAgICAgICAgICAgIC8vIFx1NjMwN1x1NUI5QXN5bWJvbElkXHU2ODNDXHU1RjBGXHJcbiAgICAgICAgICAgIHN5bWJvbElkOiAnaWNvbi1bZGlyXS1bbmFtZV0nLFxyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgXSxcclxuICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjc3M6IHtcclxuICAgICAgICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgXHJcbiAgICAgICAgICAgICAgICAgIEBpbXBvcnQgXCJAL3N0eWxlcy92YXJpYWJsZXMuc2Nzc1wiO1xyXG4gICAgICAgICAgICAgICAgICBAaW1wb3J0IFwiQC9zdHlsZXMvbWl4aW5zLnNjc3NcIjtcclxuICAgICAgICAgICAgICAgICAgQGltcG9ydCBcIkAvc3R5bGVzL2dsb2JhbC5zY3NzXCI7XHJcbiAgICAgICAgICAgICAgICAgIEBpbXBvcnQgXCJAL3N0eWxlcy9lbG1lbnR1aS5zY3NzXCI7XHJcbiAgICAgICAgICAgICAgICBgXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gIFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZQLFNBQVMsb0JBQW9CO0FBQzFSLE9BQU8sVUFBVTtBQUNqQixPQUFPLFVBQVU7QUFDakIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsNEJBQTRCO0FBSnJDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFFL0MsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQztBQUN2QyxTQUFPO0FBQUEsSUFDSCxRQUFRO0FBQUE7QUFBQSxNQUVKLE1BQU07QUFBQTtBQUFBLE1BRU4sTUFBTSxPQUFPLElBQUksYUFBYTtBQUFBO0FBQUEsTUFFOUIsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBO0FBQUEsUUFFTCxDQUFDLElBQUksaUJBQWlCLEdBQUc7QUFBQSxVQUN2QixjQUFjO0FBQUE7QUFBQSxVQUVkLFFBQVEsSUFBSTtBQUFBLFVBQ1osU0FBUyxDQUFDQSxVQUNSQSxNQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sSUFBSSxpQkFBaUIsR0FBRyxFQUFFO0FBQUEsUUFDNUQ7QUFBQSxNQUNGO0FBQUEsSUFDSjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsS0FBSztBQUFBLE1BQ0wscUJBQXFCO0FBQUE7QUFBQSxRQUVuQixVQUFVLENBQUMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQUE7QUFBQSxRQUUxRCxVQUFVO0FBQUEsTUFDWixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0QscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osZ0JBQWdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBTWxCO0FBQUEsTUFDRjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUosQ0FBQzsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
