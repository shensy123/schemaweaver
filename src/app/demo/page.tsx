'use client'

/**
 * M2 演示页:多模块表单全流程(填→联动→跨字段校验→统一提交→错误跳转)+ 三形态切换。
 * 出处:briefs 03——M2 验收口径(17 号任务书 §二):一个多模块表单页跑通全流程;
 * 页面只做编排——每模块一个引擎实例,聚合门禁走 engine/aggregate,不含引擎逻辑。
 * 约束:统一提交点击即全模块显示错误并跳转首个错误字段;三形态区独立引擎,切 schema 自动重置。
 */
import { useEffect, useMemo, useState } from 'react'

import { SchemaForm } from '@/components/form/SchemaForm'
import { FormShell } from '@/components/form/shells/FormShell'
import type { FormShellVariant } from '@/components/form/shells/variants'
import { useFormEngine } from '@/components/form/useFormEngine'
import { aggregateModules } from '@/engine/aggregate/submit'
import crossFieldSchema from '@/schema/examples/cross-field-validation.json'
import dynamicRowsSchema from '@/schema/examples/dynamic-rows.json'
import fieldLinkageSchema from '@/schema/examples/field-linkage.json'
import nestedContainersSchema from '@/schema/examples/nested-containers.json'
import type { FormSchema, FormValues } from '@/schema/types'

import styles from './demo.module.css'

const linkageSchema = fieldLinkageSchema as FormSchema
const crossSchema = crossFieldSchema as FormSchema
const rowsSchema = dynamicRowsSchema as FormSchema
const nestedSchema = nestedContainersSchema as FormSchema

/** 三形态演示区可选 schema(与主流程模块同源,展示"同一 schema 换壳") */
const SHELL_SCHEMA_OPTIONS = [
  { key: 'cross', schema: crossSchema },
  { key: 'linkage', schema: linkageSchema },
  { key: 'rows', schema: rowsSchema },
  { key: 'nested', schema: nestedSchema },
] as const

export default function DemoPage() {
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

  // 三形态演示区
  const [shellSchemaKey, setShellSchemaKey] = useState<string>('cross')
  const [shellVariant, setShellVariant] = useState<FormShellVariant>('modal')
  const [shellOpen, setShellOpen] = useState(false)
  const shellSchema =
    SHELL_SCHEMA_OPTIONS.find((option) => option.key === shellSchemaKey)?.schema ?? crossSchema
  const shellEngine = useFormEngine(shellSchema)

  // 切换 schema 时清空该区表单(reset 引用经 useCallback 稳定,不会循环触发)
  const shellReset = shellEngine.reset
  useEffect(() => {
    shellReset()
  }, [shellReset, shellSchema])

  return (
    <main className={styles['page']}>
      <h1>SchemaWeaver · M2 演示</h1>
      <p className={styles['note']}>
        四个模块跑通全流程:填 → 联动 → 跨字段校验 → 统一提交(全模块通过才放行,错误可跳转定位)。
      </p>

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
        <button type="button" className={styles['submit']} onClick={handleSubmit}>
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
          <button type="button" className={styles['reset']} onClick={handleReset}>
            重新填写
          </button>
        </section>
      ) : null}

      <section className={styles['module']}>
        <h2>三形态演示 · 同一 schema 切换弹窗/抽屉/页面</h2>
        <p className={styles['module-desc']}>
          选择 schema 与形态后打开:modal/drawer 含 Esc/backdrop 关闭、Tab 焦点圈禁、滚动锁。
        </p>
        <div className={styles['picker']}>
          <label className={styles['picker-item']}>
            schema:
            <select
              className={styles['picker-select']}
              value={shellSchemaKey}
              onChange={(event) => setShellSchemaKey(event.target.value)}
            >
              {SHELL_SCHEMA_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.schema.title}
                </option>
              ))}
            </select>
          </label>
          {(['page', 'modal', 'drawer'] as const).map((variant) => (
            <label key={variant} className={styles['picker-item']}>
              <input
                type="radio"
                name="shell-variant"
                checked={shellVariant === variant}
                onChange={() => setShellVariant(variant)}
              />
              {variant}
            </label>
          ))}
          <button
            type="button"
            className={styles['open']}
            onClick={() => setShellOpen(true)}
            disabled={shellVariant === 'page'}
          >
            打开(page 形态直接内联展示)
          </button>
        </div>
        <FormShell
          variant={shellVariant}
          title={shellSchema.title}
          open={shellVariant === 'page' ? true : shellOpen}
          onClose={() => setShellOpen(false)}
        >
          <SchemaForm engine={shellEngine} idPrefix="shell" />
        </FormShell>
      </section>
    </main>
  )
}
