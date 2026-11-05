'use client'

/**
 * 三形态演示页:同一 schema 换壳——page 内联 / modal 弹窗 / drawer 抽屉,独立展示不与表单混排。
 * 出处:briefs 03 修复轮 C(2026-11-05 用户方案)——自原 /demo 拆出;A4 修复:
 * 切换形态即关闭已开外壳、切换 schema 自动重置,状态联动即时可见。
 * 约束:行为开关来自 shells/variants 纯配置;page 形态直接内联渲染。
 */
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { SchemaForm } from '@/components/form/SchemaForm'
import { FormShell } from '@/components/form/shells/FormShell'
import type { FormShellVariant } from '@/components/form/shells/variants'
import { useFormEngine } from '@/components/form/useFormEngine'
import crossFieldSchema from '@/schema/examples/cross-field-validation.json'
import dynamicRowsSchema from '@/schema/examples/dynamic-rows.json'
import fieldLinkageSchema from '@/schema/examples/field-linkage.json'
import nestedContainersSchema from '@/schema/examples/nested-containers.json'
import type { FormSchema } from '@/schema/types'

import styles from './shells.module.css'

const SCHEMA_OPTIONS = [
  { key: 'cross', schema: crossFieldSchema as FormSchema },
  { key: 'linkage', schema: fieldLinkageSchema as FormSchema },
  { key: 'rows', schema: dynamicRowsSchema as FormSchema },
  { key: 'nested', schema: nestedContainersSchema as FormSchema },
] as const

const VARIANT_NOTES: Record<FormShellVariant, string> = {
  page: 'page:直通内联渲染,无遮罩无标题栏,滚动与焦点不受限',
  modal: 'modal:居中弹窗+遮罩,Esc/遮罩点击关闭,Tab 圈禁,滚动锁定',
  drawer: 'drawer:右侧抽屉+遮罩,关闭行为与 modal 一致,布局不同',
}

export default function ShellsPage() {
  const [schemaKey, setSchemaKey] = useState<string>('cross')
  const [variant, setVariant] = useState<FormShellVariant>('modal')
  const [open, setOpen] = useState(false)
  const schema =
    SCHEMA_OPTIONS.find((option) => option.key === schemaKey)?.schema ?? SCHEMA_OPTIONS[0].schema
  const engine = useFormEngine(schema)

  // 切换 schema 时清空该区表单(reset 引用经 useCallback 稳定,不会循环触发)
  const engineReset = engine.reset
  useEffect(() => {
    engineReset()
  }, [engineReset, schema])

  function switchVariant(next: FormShellVariant): void {
    setVariant(next)
    setOpen(false) // A4:切形态即收起旧外壳,状态联动即时可见
  }

  function switchSchema(next: string): void {
    setSchemaKey(next)
    setOpen(false) // 切 schema 同步收起,避免旧 schema 内容残留壳内
  }

  return (
    <main className={styles['page']}>
      <header className={styles['header']}>
        <Link href="/" className={styles['back']}>
          ← 返回导览
        </Link>
        <h1>三形态外壳演示</h1>
        <p className={styles['note']}>
          同一份表单换三种「外壳」展示:整页铺开(page)、居中弹窗(modal)、右侧抽屉(drawer)——内容不变,壳可换。弹窗/抽屉支持
          Esc 关闭、点空白处关闭、键盘 Tab 焦点锁定在壳内、背景页面锁定不滚动。
        </p>
      </header>

      <section className={styles['picker']}>
        <label className={styles['picker-item']}>
          schema:
          <select
            className={styles['picker-select']}
            value={schemaKey}
            onChange={(event) => switchSchema(event.target.value)}
          >
            {SCHEMA_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.schema.title}
              </option>
            ))}
          </select>
        </label>
        <div className={styles['variant-group']}>
          {(Object.keys(VARIANT_NOTES) as FormShellVariant[]).map((item) => (
            <label key={item} className={styles['picker-item']}>
              <input
                type="radio"
                name="shell-variant"
                checked={variant === item}
                onChange={() => switchVariant(item)}
              />
              {item}
            </label>
          ))}
        </div>
        <button
          type="button"
          className={styles['primary-btn']}
          onClick={() => setOpen(true)}
          disabled={variant === 'page'}
        >
          打开
        </button>
      </section>
      <p className={styles['variant-note']}>{VARIANT_NOTES[variant]}</p>

      <FormShell
        variant={variant}
        title={schema.title}
        open={variant === 'page' ? true : open}
        onClose={() => setOpen(false)}
      >
        <SchemaForm engine={engine} idPrefix="shell" />
      </FormShell>
    </main>
  )
}
