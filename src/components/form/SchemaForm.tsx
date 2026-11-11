'use client'

/**
 * SchemaForm:RenderNode 树 → 组件的递归映射(UI 薄壳,零逻辑,D2 拍板)。
 * 出处:briefs 03——M2 UI 薄壳层;树形与可见性已在 resolve 求毕,这里只做 dumb 渲染。
 * 约束:object 容器渲染为 fieldset 分组;array 字段与标量字段各委托专属控件。
 */
import type { RenderNode } from '@/engine/renderer/resolve'

import { ArrayField } from './fields/ArrayField'
import { FieldControl } from './fields/FieldControl'
import type { UseFormEngineResult } from './useFormEngine'
import styles from './form.module.css'

export function SchemaForm({
  engine,
  idPrefix = '',
}: {
  engine: UseFormEngineResult
  /** ID 命名空间(多模块同页/跨 schema 键重复时防 ID 撞车),如模块 key */
  idPrefix?: string
}) {
  return (
    <div className={styles['form']}>
      {engine.renderNodes.map((node) => (
        <RenderNodeView key={node.field.key} node={node} engine={engine} idPrefix={idPrefix} />
      ))}
    </div>
  )
}

function RenderNodeView({
  node,
  engine,
  idPrefix,
}: {
  node: RenderNode
  engine: UseFormEngineResult
  idPrefix: string
}) {
  if (node.kind === 'group') {
    return (
      <fieldset className={styles['group']}>
        <legend className={styles['group-label']}>{node.field.label}</legend>
        {node.children.map((child) => (
          <RenderNodeView key={child.field.key} node={child} engine={engine} idPrefix={idPrefix} />
        ))}
      </fieldset>
    )
  }
  if (node.field.type === 'array') {
    return <ArrayField field={node.field} engine={engine} idPrefix={idPrefix} />
  }
  return <FieldControl field={node.field} engine={engine} idPrefix={idPrefix} />
}
