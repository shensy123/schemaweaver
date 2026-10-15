# SchemaWeaver

Schema 驱动的表单引擎(个人学习项目):用一份 JSON Schema 描述表单的结构、校验与联动,由引擎负责渲染成可交互表单。

## 能力规划(Schema v0.1)

| 能力                            | 状态        | 示例                                              |
| ------------------------------- | ----------- | ------------------------------------------------- |
| 动态渲染(schema → 多种控件)     | v0.1 已定义 | `src/schema/examples/dynamic-rendering.json`      |
| 跨字段校验(match / greaterThan) | v0.1 已定义 | `src/schema/examples/cross-field-validation.json` |
| 字段联动(条件显隐)              | v0.1 已定义 | `src/schema/examples/field-linkage.json`          |
| 动态增删行(array 字段)          | v0.1 已定义 | `src/schema/examples/dynamic-rows.json`           |

首页在线展示四份示例 schema 的完整 JSON;渲染引擎在后续里程碑实现。

## 在线 Demo

https://schemaweaver-nu.vercel.app/

## 本地开发

```bash
pnpm install
pnpm dev # http://localhost:3000
```

## 脚本

| 命令                                | 作用                              |
| ----------------------------------- | --------------------------------- |
| `pnpm dev`                          | 开发服务器(Turbopack)             |
| `pnpm build`                        | 生产构建(含类型检查)              |
| `pnpm start`                        | 启动生产服务器(需先 build)        |
| `pnpm lint`                         | ESLint 检查                       |
| `pnpm typecheck`                    | TypeScript 类型检查(tsc --noEmit) |
| `pnpm test:unit`                    | Vitest 单元测试                   |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 校验            |
| `pnpm check`                        | 上述五闸门一键串联,全绿才算过     |

## 开发方式

AI 协作开发:架构决策与代码评审由本人主导,实现过程与 AI 结对完成,并以个人质量门禁体系约束产出——每次提交经 commitlint 规范校验,任务闭环须五闸门(typecheck / lint / format / test / build)全绿。

## 技术栈

Next.js 16(App Router)· React 19 · TypeScript · Vitest · Vercel 部署

## License

MIT
