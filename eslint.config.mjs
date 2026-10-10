import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // 非应用代码区(治理资产/本地数据,不在公开仓库内)
    'docs/**',
    'ai-workflow/**',
    '_drafts/**',
    '.agents/**',
    'prompts/**',
    'time-tracker/**',
    'daily-report/**',
    '.zcode/**',
  ]),
])

export default eslintConfig
