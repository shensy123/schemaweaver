module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能（feature）
        'fix', // 修补bug
        'docs', // 文档（documentation）
        'style', // 格式（不影响代码运行的变动）
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'ci', // 持续集成
        'revert', // 回滚到上一个版本
        'build', // 构建过程或外部依赖的改动
      ],
    ],
    'subject-full-stop': [0, 'never'], // 关闭提交信息结尾必须有句号的规则
    'subject-case': [0, 'never'], // 关闭提交信息必须使用特定大小写的规则
  },
}
