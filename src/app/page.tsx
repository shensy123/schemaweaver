/**
 * 首页:M1 验收产物,静态预览四份能力示例 schema 的完整 JSON。
 * 出处:briefs 01——schema v0.1 四能力示例定稿(动态渲染/跨字段校验/字段联动/动态增删行)。
 * 约束:纯静态展示零交互;渲染引擎 M2 落地后本页改造为真表单演示。
 */
import dynamicRendering from '@/schema/examples/dynamic-rendering.json'
import crossField from '@/schema/examples/cross-field-validation.json'
import fieldLinkage from '@/schema/examples/field-linkage.json'
import dynamicRows from '@/schema/examples/dynamic-rows.json'

const examples = [
  { title: '① 动态渲染', schema: dynamicRendering },
  { title: '② 跨字段校验', schema: crossField },
  { title: '③ 字段联动', schema: fieldLinkage },
  { title: '④ 动态增删行', schema: dynamicRows },
]

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <h1>SchemaWeaver · Schema v0.1</h1>
      <p>以下为四个能力示例的 schema(纯 JSON,渲染引擎见 M2)。</p>
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
      <p style={{ marginTop: 32, color: '#71717a' }}>M1 · schema v0.1 · push main 即自动部署</p>
    </main>
  )
}
