module.exports = {
  baseUrl: process.env.NODE_ENV === "production" ? "./" : "/",
  outputDir: process.env.outputDir,
  pages: {
      index: {
          // page 的入口
          entry: "src/main.js",
          // 模板来源
          template: "public/index.html", // 这里用来区分加载那个 html
          // 在 dist/index.html 的输出
          filename: "index.html",
          chunks: ["chunk-vendors", "chunk-common", "index"]
      }
  },
  configureWebpack: {
      externals: {
          vue: "Vue",
          "element-ui": "ELEMENT",
          "axios": "axios"
      }
  }
};