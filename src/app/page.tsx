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
    </main>
  )
}
