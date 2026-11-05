'use client'

/**
 * 全流程演示页:视口高布局(标题吸顶+表单区内滚+底栏常驻),底栏左=可点定位的错误摘要、
 * 右=统一提交;提交成功弹 wide modal——左栏四模块通过状态,右栏 JSON↔中文对照表往复切换。
 * 出处:briefs 03 修复轮 2(2026-11-05 用户拍板方案,任务 6/7);表单编排逻辑沿用 M2 主批。
 * 约束:提交失败完整保留已填数据(A3 铁律);隐藏剔除统计页面侧自算不动 engine。
 */
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { JsonHighlight } from '@/components/json-highlight/JsonHighlight'
import { SchemaForm } from '@/components/form/SchemaForm'
import { FormShell } from '@/components/form/shells/FormShell'
import { useFormEngine } from '@/components/form/useFormEngine'
import { aggregateModules } from '@/engine/aggregate/submit'
import { evaluateVisibility } from '@/engine/linkage/visibility'
import { collectFields } from '@/schema/collect'
import crossFieldSchema from '@/schema/examples/cross-field-validation.json'
import dynamicRowsSchema from '@/schema/examples/dynamic-rows.json'
import fieldLinkageSchema from '@/schema/examples/field-linkage.json'
import nestedContainersSchema from '@/schema/examples/nested-containers.json'
import type { FormSchema, FormValues } from '@/schema/types'

import styles from './flow.module.css'

const linkageSchema = fieldLinkageSchema as FormSchema
const crossSchema = crossFieldSchema as FormSchema
const rowsSchema = dynamicRowsSchema as FormSchema
const nestedSchema = nestedContainersSchema as FormSchema

type SuccessView = 'json' | 'table'

export default function FlowPage() {
  const linkageEngine = useFormEngine(linkageSchema)
  const crossEngine = useFormEngine(crossSchema)
  const rowsEngine = useFormEngine(rowsSchema)
  const nestedEngine = useFormEngine(nestedSchema)

  const moduleList = [
    { key: 'linkage', schema: linkageSchema, engine: linkageEngine },
    { key: 'cross', schema: crossSchema, engine: crossEngine },
    { key: 'rows', schema: rowsSchema, engine: rowsEngine },
    { key: 'nested', schema: nestedSchema, engine: nestedEngine },
  ]

  const aggregate = useMemo(
    () =>
      aggregateModules([
        {
          key: 'linkage',
          title: linkageSchema.title,
          schema: linkageSchema,
          values: linkageEngine.values,
        },
        { key: 'cross', title: crossSchema.title, schema: crossSchema, values: crossEngine.values },
        { key: 'rows', title: rowsSchema.title, schema: rowsSchema, values: rowsEngine.values },
        {
          key: 'nested',
          title: nestedSchema.title,
          schema: nestedSchema,
          values: nestedEngine.values,
        },
      ]),
    [linkageEngine.values, crossEngine.values, rowsEngine.values, nestedEngine.values],
  )

  // 模块附加信息:字段总数与已填隐藏字段剔除数(页面侧自算,不动 engine;入参内联避免 deps 警告)
  const moduleExtras = useMemo(
    () => [
      countModuleExtras('linkage', linkageSchema, linkageEngine.values),
      countModuleExtras('cross', crossSchema, crossEngine.values),
      countModuleExtras('rows', rowsSchema, rowsEngine.values),
      countModuleExtras('nested', nestedSchema, nestedEngine.values),
    ],
    [linkageEngine.values, crossEngine.values, rowsEngine.values, nestedEngine.values],
  )

  const [submittedPayload, setSubmittedPayload] = useState<Record<string, FormValues> | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successView, setSuccessView] = useState<SuccessView>('json')

  function locateModule(key: string): void {
    document.getElementById(`module-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleSubmit(): void {
    for (const mod of moduleList) mod.engine.submitAttempt()
    if (aggregate.canSubmit) {
      setSubmittedPayload(aggregate.payload)
      setSuccessOpen(true)
      setSuccessView('json')
      return
    }
    const firstInvalid = aggregate.modules.find((status) => !status.valid)
    const firstError = firstInvalid?.firstError
    if (firstInvalid !== undefined && firstError != null) {
      document
        .getElementById(`field-${firstInvalid.key}-${firstError.fieldKey}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function handleReset(): void {
    for (const mod of moduleList) mod.engine.reset()
    setSubmittedPayload(null)
    setSuccessOpen(false)
  }

  /** 对照表数据:字段中文名(自 schema label)/JSON 路径/提交值(入参内联,同 aggregate) */
  const tableData = useMemo(() => {
    if (submittedPayload === null) return []
    const blocks = [
      { key: 'linkage', schema: linkageSchema },
      { key: 'cross', schema: crossSchema },
      { key: 'rows', schema: rowsSchema },
      { key: 'nested', schema: nestedSchema },
    ]
    return blocks.map((mod) => {
      const labelOf = new Map(
        collectFields(mod.schema.fields).map((field) => [field.key, field.label]),
      )
      const values = submittedPayload[mod.key] ?? {}
      const rowsOfModule = Object.entries(values).map(([key, value]) => ({
        label: labelOf.get(key) ?? key,
        path: `${mod.key}.${key}`,
        value: shortValue(value),
      }))
      return { key: mod.key, title: mod.schema.title, rows: rowsOfModule }
    })
  }, [submittedPayload])

  return (
    <main className={styles['page']}>
      <header className={styles['header']}>
        <Link href="/" className={styles['back']}>
          ← 返回导览
        </Link>
        <h1>表单全流程演示</h1>
        <p className={styles['note']}>
          亲手填一张四模块表单:字段会按你的选择出现/隐藏(联动),填错当场被拦(校验),全部通过才能统一提交——点错可一键跳回出错位置。
        </p>
      </header>

      <section className={styles['form-scroll']} id="form-scroll">
        {moduleList.map((mod) => (
          <section key={mod.key} id={`module-${mod.key}`} className={styles['module']}>
            <h2>{mod.schema.title}</h2>
            {mod.schema.description ? (
              <p className={styles['module-desc']}>{mod.schema.description}</p>
            ) : null}
            <SchemaForm engine={mod.engine} idPrefix={mod.key} />
          </section>
        ))}
      </section>

      <footer className={styles['submit-bar']}>
        <div className={styles['error-summary']}>
          {aggregate.modules.map((status) => (
            <button
              key={status.key}
              type="button"
              className={`${styles['summary-item']} ${status.valid ? styles['ok'] : styles['bad']}`}
              onClick={() => locateModule(status.key)}
              title="点击定位到该模块"
            >
              {status.valid ? '✓' : '✗'} {status.title}
              {status.valid ? '' : ` · ${status.errorCount} 处错误`}
            </button>
          ))}
        </div>
        <div className={styles['submit-actions']}>
          {submittedPayload !== null ? (
            <button type="button" className={styles['ghost-btn']} onClick={handleReset}>
              重新填写
            </button>
          ) : null}
          <button type="button" className={styles['primary-btn']} onClick={handleSubmit}>
            统一提交
          </button>
        </div>
      </footer>

      <FormShell
        variant="modal"
        wide
        title="提交成功 · 聚合结果"
        open={submittedPayload !== null && successOpen}
        onClose={() => setSuccessOpen(false)}
      >
        {submittedPayload !== null ? (
          <div className={styles['success']}>
            <div className={styles['success-left']}>
              <h3 className={styles['success-title']}>模块通过状态</h3>
              {moduleList.map((mod) => {
                const status = aggregate.modules.find((item) => item.key === mod.key)
                const extra = moduleExtras.find((item) => item.key === mod.key)
                return (
                  <p key={mod.key} className={styles['success-module']}>
                    <span className={styles['ok']}>✓</span> {mod.schema.title}
                    <span className={styles['success-meta']}>
                      {extra?.fieldCount ?? 0} 个字段 · {status?.errorCount ?? 0} 处错误
                      {extra !== undefined && extra.stripped > 0
                        ? ` · 已剔除 ${extra.stripped} 个隐藏字段`
                        : ''}
                    </span>
                  </p>
                )
              })}
              <p className={styles['success-hint']}>
                隐藏字段(未出现/未选中的条件字段)的值不会进提交数据。
              </p>
            </div>
            <div className={styles['success-right']}>
              <div className={styles['success-toolbar']}>
                <button
                  type="button"
                  className={styles['ghost-btn']}
                  onClick={() => setSuccessView(successView === 'json' ? 'table' : 'json')}
                >
                  {successView === 'json' ? '切到中文对照表 →' : '← 切回 JSON'}
                </button>
              </div>
              {successView === 'json' ? (
                <pre className={styles['success-json']}>
                  <JsonHighlight source={JSON.stringify(submittedPayload, null, 2)} />
                </pre>
              ) : (
                <div className={styles['success-tables']}>
                  {tableData.map((block) => (
                    <section key={block.key} className={styles['table-block']}>
                      <h4 className={styles['table-title']}>{block.title}</h4>
                      <table className={styles['table']}>
                        <thead>
                          <tr>
                            <th>字段中文名</th>
                            <th>JSON 路径</th>
                            <th>提交值</th>
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row) => (
                            <tr key={row.path}>
                              <td>{row.label}</td>
                              <td className={styles['table-path']}>{row.path}</td>
                              <td>{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </FormShell>
    </main>
  )
}

/** 值的短展示:JSON 序列化后截断,超长省略 */
function shortValue(value: unknown): string {
  const text = JSON.stringify(value) ?? 'null'
  if (text.length <= 40) return text
  return `${text.slice(0, 40)}…`
}

/** 模块附加信息:字段总数与已填隐藏字段剔除数(纯函数) */
function countModuleExtras(key: string, schema: FormSchema, values: FormValues) {
  const { hiddenKeys } = evaluateVisibility(schema.fields, values)
  let stripped = 0
  for (const fieldKey of Object.keys(values)) {
    if (hiddenKeys.has(fieldKey)) stripped += 1
  }
  return { key, fieldCount: collectFields(schema.fields).length, stripped }
}
