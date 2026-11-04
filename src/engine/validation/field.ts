/**
 * 单字段校验编排:普通字段走 validateRule;array 字段做行数 required+逐行逐列校验。
 * 出处:briefs 03——M2 校验分块(D1:错误统一为 FieldError[],行/列可选定位)。
 * 约束:object 容器自身无校验语义,子字段由 form.ts 递归编排。
 */
import type { FieldSchema } from '@/schema/types'
import type { ArrayRow, FieldError } from '@/engine/core/types'
import { validateRule } from './field-rule'

export function validateField(field: FieldSchema, value: unknown): FieldError[] {
  if (field.type === 'array') {
    return validateArrayField(field, value)
  }
  if (field.type === 'object') {
    return []
  }
  const message = validateRule(field.validation ?? {}, value)
  return message === null ? [] : [{ fieldKey: field.key, message }]
}

function validateArrayField(field: FieldSchema, value: unknown): FieldError[] {
  const rule = field.validation ?? {}
  const rows: ArrayRow[] = Array.isArray(value) ? (value as ArrayRow[]) : []
  if (rule.required === true && rows.length === 0) {
    return [{ fieldKey: field.key, message: rule.message ?? '至少添加一行' }]
  }
  const errors: FieldError[] = []
  rows.forEach((row, rowIndex) => {
    for (const column of field.columns ?? []) {
      const message = validateRule(column.validation ?? {}, row[column.key])
      if (message !== null) {
        errors.push({ fieldKey: field.key, message, row: rowIndex, column: column.key })
      }
    }
  })
  return errors
}
