/**
 * 联动引擎:条件显隐求值,消费 schema visibleWhen 语法(v0.2 与 v0.1 同语法)。
 * 出处:briefs 03——M2 联动分块;假设 A4/A5(2026-11-04 拍板):单遍求值,隐藏容器整棵子树剪枝。
 * 约束:纯函数;隐藏字段值保留在 state,由提交侧剔除——本模块只回答"谁可见"。
 */
import type { FieldSchema, FormValues } from '@/schema/types'

export interface VisibilityResult {
  /** 可见字段 key(含可见容器自身) */
  visibleKeys: Set<string>
  /** 隐藏字段 key(含被剪枝子树全部后代,供校验跳过与提交剔除) */
  hiddenKeys: Set<string>
}

export function evaluateVisibility(fields: FieldSchema[], values: FormValues): VisibilityResult {
  const visibleKeys = new Set<string>()
  const hiddenKeys = new Set<string>()
  walk(fields, values, false, visibleKeys, hiddenKeys)
  return { visibleKeys, hiddenKeys }
}

function isVisible(field: FieldSchema, values: FormValues): boolean {
  if (!field.visibleWhen) return true
  return values[field.visibleWhen.field] === field.visibleWhen.equals
}

function walk(
  fields: FieldSchema[],
  values: FormValues,
  parentHidden: boolean,
  visibleKeys: Set<string>,
  hiddenKeys: Set<string>,
): void {
  for (const field of fields) {
    if (parentHidden || !isVisible(field, values)) {
      hiddenKeys.add(field.key)
      markSubtreeHidden(field.fields ?? [], hiddenKeys)
    } else {
      visibleKeys.add(field.key)
      if (field.type === 'object') {
        walk(field.fields ?? [], values, false, visibleKeys, hiddenKeys)
      }
    }
  }
}

/** 被剪枝子树的后代不再求值其自身 visibleWhen——剪枝即整棵隐藏 */
function markSubtreeHidden(fields: FieldSchema[], hiddenKeys: Set<string>): void {
  for (const field of fields) {
    hiddenKeys.add(field.key)
    markSubtreeHidden(field.fields ?? [], hiddenKeys)
  }
}
