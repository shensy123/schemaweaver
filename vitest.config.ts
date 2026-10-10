import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // 只收集应用源码区的测试文件(治理资产区不进闸门)
    include: ['src/**/*.spec.{ts,tsx}'],
    // 纯逻辑层(schema 解析/校验/联动)默认跑 node 环境;
    // 组件测试在文件头用 `// @vitest-environment jsdom` 单独指定
    environment: 'node',
  },
})
