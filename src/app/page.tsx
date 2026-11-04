/**
 * 首页:M1 验收产物,静态预览五份能力示例 schema 的完整 JSON;M2 交互演示入口在 /demo。
 * 出处:briefs 01——schema v0.1 四能力示例;briefs 03——v0.2 嵌套容器示例 + 演示页入口。
 * 约束:纯静态展示零交互;本页不承载引擎渲染,真表单演示一律走 demo 路由。
 */
import Link from 'next/link'

import dynamicRendering from '@/schema/examples/dynamic-rendering.json'
import crossField from '@/schema/examples/cross-field-validation.json'
import fieldLinkage from '@/schema/examples/field-linkage.json'
import dynamicRows from '@/schema/examples/dynamic-rows.json'
import nestedContainers from '@/schema/examples/nested-containers.json'

const examples = [
  { title: '① 动态渲染', schema: dynamicRendering },
  { title: '② 跨字段校验', schema: crossField },
  { title: '③ 字段联动', schema: fieldLinkage },
  { title: '④ 动态增删行', schema: dynamicRows },
  { title: '⑤ 嵌套容器(v0.2)', schema: nestedContainers },
]

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <h1>SchemaWeaver · Schema v0.2</h1>
      <p>
        以下为五个能力示例的 schema(纯 JSON),交互演示(填→联动→跨字段校验→统一提交、三形态)见{' '}
        <Link href="/demo">M2 演示页</Link>。
      </p>
      {examples.map(({ title, schema }) => (
        <section key={title}>
          <h2>{title}</h2>
          <pre
            style={{
              background: '#f4f4f5',
              padding: 16,
              borderRadius: 8,
              overflowX: 'auto',
              fontSize: 13,
            }}
          >
            {JSON.stringify(schema, null, 2)}
          </pre>
        </section>
      ))}
      <p style={{ marginTop: 32, color: '#71717a' }}>M2 · schema v0.2 · push main 即自动部署</p>
    </main>
  )
}
