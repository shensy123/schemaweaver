import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// 头注门禁本地规则(docs/coding-standard/comment-style.md §5):非测试 .ts/.tsx 前 8 行内须有注释
const requireFileHeader = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    const comments = context.sourceCode.getAllComments()
    const hasHeader = comments.some((comment) => comment.loc.start.line <= 8)
    return {
      Program(node) {
        if (!hasHeader) {
          context.report({
            node,
            message: '文件前 8 行内须有注释头注(见 docs/coding-standard/comment-style.md)',
          })
        }
      },
    }
  },
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 注释体系 TODO 禁令门禁(comment-style §5):工作项走 task-backlog,不留代码标记
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-warning-comments': [
        'error',
        { terms: ['todo', 'fixme', 'hack', 'xxx'], location: 'anywhere' },
      ],
    },
  },
  // 头注门禁(comment-style §5):测试文件除外
  {
    plugins: { sw: { rules: { 'require-file-header': requireFileHeader } } },
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**', '**/*.spec.*', '**/*.test.*'],
    rules: {
      'sw/require-file-header': 'error',
    },
  },
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
