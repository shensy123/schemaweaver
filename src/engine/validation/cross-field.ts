/**
 * 跨字段校验:v0.2 两原语(match/greaterThan)求值,错误挂载 rule.field。
 * 出处:briefs 03——M2 校验分块;假设 A3/A4(2026-11-04 拍板):
 *   任一端空值或隐藏则跳过规则,必填性归字段级规则。
 * 约束:greaterThan 对 number 直接比,其余按字符串字典序(ISO 日期 YYYY-MM-DD 即时间序)。
 */
import type { CrossFieldRule, FormValues } from '@/schema/types'
import type { FieldError } from '@/engine/core/types'

export function evaluateCrossRules(
  rules: CrossFieldRule[],
  values: FormValues,
  visibleKeys: Set<string>,
): FieldError[] {
  const errors: FieldError[] = []
  for (const rule of rules) {
    if (!visibleKeys.has(rule.field) || !visibleKeys.has(rule.target)) {
      continue
    }
    const left = values[rule.field]
    const right = values[rule.target]
    if (isEmptyValue(left) || isEmptyValue(right)) {
      continue
    }
    const passed = rule.type === 'match' ? left === right : isGreaterThan(left, right)
    if (!passed) {
      errors.push({ fieldKey: rule.field, message: rule.message })
    }
  }
  return errors
}

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function isGreaterThan(left: unknown, right: unknown): boolean {
  if (typeof left === 'number' && typeof right === 'number') {
    return left > right
  }
  return String(left) > String(right)
}
