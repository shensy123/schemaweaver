/**
 * 多模块校验状态聚合与统一提交(复盘锚点 A9"多 Form 统一提交"):
 * 全模块通过才可提交,错误可定位到模块与字段。
 * 出处:briefs 03——M2 聚合分块;假设 A7(拍板):payload = { 模块key: 剔除隐藏后的值 }。
 * 约束:纯函数;单模块的可见性/校验复用 linkage/validation,本模块只做跨模块编排。
 */
import type { FormSchema, FormValues } from '@/schema/types'
import type { FieldError } from '@/engine/core/types'
import { evaluateVisibility } from '@/engine/linkage/visibility'
import { validateForm } from '@/engine/validation/form'

export interface ModuleInput {
  /** 模块标识(demo 页定位锚点与提交 payload 键) */
  key: string
  title: string
  schema: FormSchema
  values: FormValues
}

export interface ModuleStatus {
  key: string
  title: string
  valid: boolean
  errorCount: number
  firstError: FieldError | null
}

export interface AggregateResult {
  /** 统一提交门禁:全模块通过才为 true */
  canSubmit: boolean
  modules: ModuleStatus[]
  /** 提交载荷(canSubmit=false 时仍产出,供预览;键=模块 key) */
  payload: Record<string, FormValues>
}

export function aggregateModules(modules: ModuleInput[]): AggregateResult {
  const statuses: ModuleStatus[] = []
  const payload: Record<string, FormValues> = {}
  for (const mod of modules) {
    const { visibleKeys, hiddenKeys } = evaluateVisibility(mod.schema.fields, mod.values)
    const { errors, valid } = validateForm(mod.schema, mod.values, visibleKeys)
    statuses.push({
      key: mod.key,
      title: mod.title,
      valid,
      errorCount: errors.length,
      firstError: errors[0] ?? null,
    })
    payload[mod.key] = collectSubmitValues(mod.values, hiddenKeys)
  }
  return { canSubmit: statuses.every((status) => status.valid), modules: statuses, payload }
}

/** 剔除隐藏字段与未赋值键,得到干净提交载荷(隐藏字段值保留在 state,仅提交侧剔除) */
export function collectSubmitValues(values: FormValues, hiddenKeys: Set<string>): FormValues {
  const result: FormValues = {}
  for (const [key, value] of Object.entries(values)) {
    if (hiddenKeys.has(key)) continue
    if (value === undefined) continue
    result[key] = value
  }
  return result
}
