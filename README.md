# SchemaWeaver

Schema 驱动的表单引擎(个人学习项目):用一份 JSON Schema 描述表单的结构、校验与联动,由引擎负责渲染成可交互表单。

## 能力一览(Schema v0.2 · M2 已实现)

| 能力                            | 状态      | 示例                                              |
| ------------------------------- | --------- | ------------------------------------------------- |
| 动态渲染(schema → 六型控件)     | M2 已实现 | `src/schema/examples/dynamic-rendering.json`      |
| 跨字段校验(match / greaterThan) | M2 已实现 | `src/schema/examples/cross-field-validation.json` |
| 字段联动(条件显隐)              | M2 已实现 | `src/schema/examples/field-linkage.json`          |
| 动态增删行(array 字段)          | M2 已实现 | `src/schema/examples/dynamic-rows.json`           |
| 嵌套容器(object 分组嵌套,v0.2)  | M2 已实现 | `src/schema/examples/nested-containers.json`      |

M2 交付:递归渲染器(RenderNode 树解析+React 薄壳)、联动引擎(单遍求值+隐藏子树剪枝)、校验聚合统一提交(全模块通过才放行,错误可定位跳转)、弹窗/抽屉/页面三形态外壳;引擎纯逻辑层 68 例单测。首页在线展示五份示例 schema;`/demo` 提供多模块全流程交互演示(填 → 联动 → 跨字段校验 → 统一提交,含三形态切换)。

## 在线 Demo

https://schemaweaver-nu.vercel.app/(首页 schema 预览;`/demo` 为 M2 交互演示)

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
| `pnpm lint:style`                   | stylelint 样式检查                |
| `pnpm typecheck`                    | TypeScript 类型检查(tsc --noEmit) |
| `pnpm test:unit`                    | Vitest 单元测试                   |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 校验            |
| `pnpm check`                        | 上述六闸门一键串联,全绿才算过     |

## 开发方式

AI 协作开发:架构决策与代码评审由本人主导,实现过程与 AI 结对完成,并以个人质量门禁体系约束产出——每次提交经 commitlint 规范校验,任务闭环须六闸门(typecheck / lint / lint:style / format / test / build)全绿。

## 技术栈

Next.js 16(App Router)· React 19 · TypeScript · 原生 CSS Modules · Vitest · Vercel 部署

## License

MIT
