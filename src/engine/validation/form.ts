/**
 * 整表单校验编排:递归展开嵌套容器 → 可见叶子逐字段校验 → 跨字段规则求值。
 * 出处:briefs 03——M2 校验分块;v0.1 约定:隐藏字段不参与校验。
 * 约束:可见性由 linkage 求值后以参数传入,校验模块不依赖联动模块(单向解耦)。
 */
import { collectFields } from '@/schema/collect'
import type { FormSchema, FormValues } from '@/schema/types'
import type { FieldError } from '@/engine/core/types'
import { evaluateCrossRules } from './cross-field'
import { validateField } from './field'

export interface FormValidationResult {
  errors: FieldError[]
  valid: boolean
  /** 出错字段 key 集(UI 快速查询与聚合定位用) */
  errorKeys: Set<string>
}

export function validateForm(
  schema: FormSchema,
  values: FormValues,
  visibleKeys: Set<string>,
): FormValidationResult {
  const errors: FieldError[] = []
  for (const field of collectFields(schema.fields)) {
    if (!visibleKeys.has(field.key)) continue
    errors.push(...validateField(field, values[field.key]))
  }
  errors.push(...evaluateCrossRules(schema.crossFieldRules ?? [], values, visibleKeys))
  const errorKeys = new Set(errors.map((error) => error.fieldKey))
  return { errors, valid: errors.length === 0, errorKeys }
}
