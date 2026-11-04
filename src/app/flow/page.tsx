'use client'

/**
 * 全流程演示页:四个模块跑通 填→联动→跨字段校验→统一提交(错误定位跳转)。
 * 出处:briefs 03 修复轮 C——自原 /demo 表单区拆出独立路由;编排逻辑不变。
 * 约束:统一提交点击即全模块显示错误并跳转首个错误字段;提交失败完整保留已填数据(A3 铁律)。
 */
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { SchemaForm } from '@/components/form/SchemaForm'
import { useFormEngine } from '@/components/form/useFormEngine'
import { aggregateModules } from '@/engine/aggregate/submit'
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

  const [submittedPayload, setSubmittedPayload] = useState<Record<string, FormValues> | null>(null)

  function handleSubmit(): void {
    for (const mod of moduleList) mod.engine.submitAttempt()
    if (aggregate.canSubmit) {
      setSubmittedPayload(aggregate.payload)
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
  }

  return (
    <main className={styles['page']}>
      <header className={styles['header']}>
        <Link href="/" className={styles['back']}>
          ← 返回导览
        </Link>
        <h1>表单全流程演示</h1>
        <p className={styles['note']}>
          检验:填写 → 联动显隐 → 跨字段校验 → 统一提交。四个模块全通过才放行;点击提交可定位首个错误,
          提交失败时已填数据完整保留。
        </p>
      </header>

      <div className={styles['status-bar']}>
        {aggregate.modules.map((status) => (
          <span key={status.key} className={status.valid ? styles['ok'] : styles['bad']}>
            {status.valid ? '✓' : '✗'} {status.title}
            {status.valid ? '' : `(${status.errorCount} 处错误)`}
          </span>
        ))}
      </div>

      {moduleList.map((mod) => (
        <section key={mod.key} id={`module-${mod.key}`} className={styles['module']}>
          <h2>{mod.schema.title}</h2>
          {mod.schema.description ? (
            <p className={styles['module-desc']}>{mod.schema.description}</p>
          ) : null}
          <SchemaForm engine={mod.engine} idPrefix={mod.key} />
        </section>
      ))}

      <div className={styles['submit-bar']}>
        <button type="button" className={styles['primary-btn']} onClick={handleSubmit}>
          统一提交
        </button>
        <span className={aggregate.canSubmit ? styles['ok'] : styles['bad']}>
          {aggregate.canSubmit ? '全部模块通过,可提交' : '存在未通过模块,点击定位首个错误'}
        </span>
      </div>

      {submittedPayload !== null ? (
        <section className={styles['payload']}>
          <h3>提交成功 · 聚合载荷(隐藏字段已剔除)</h3>
          <pre>{JSON.stringify(submittedPayload, null, 2)}</pre>
          <button type="button" className={styles['ghost-btn']} onClick={handleReset}>
            重新填写
          </button>
        </section>
      ) : null}
    </main>
  )
}
