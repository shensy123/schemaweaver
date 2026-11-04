/**
 * 单条字段校验规则求值:v0.2 ValidationRule 原语逐条判定。
 * 出处:briefs 03——M2 校验分块;假设 A1/A2/A6(2026-11-04 拍板):
 *   required+boolean 须为 true;空值跳过区间/格式规则;非法正则视为规则缺失。
 * 约束:纯函数;返回首条失败文案(null=通过)。
 */
import type { ValidationRule } from '@/schema/types'

export function validateRule(rule: ValidationRule, value: unknown): string | null {
  if (isEmpty(value)) {
    return rule.required === true ? (rule.message ?? '必填项') : null
  }
  if (rule.required === true && typeof value === 'boolean' && !value) {
    return rule.message ?? '必填项'
  }
  if (typeof value === 'string') {
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return rule.message ?? `最少 ${rule.minLength} 个字符`
    }
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return rule.message ?? `最多 ${rule.maxLength} 个字符`
    }
    if (rule.pattern !== undefined) {
      const pattern = tryCompilePattern(rule.pattern)
      if (pattern !== null && !pattern.test(value)) {
        return rule.message ?? '格式不正确'
      }
    }
  }
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return rule.message ?? `不能小于 ${rule.min}`
    }
    if (rule.max !== undefined && value > rule.max) {
      return rule.message ?? `不能大于 ${rule.max}`
    }
  }
  return null
}

/** 空值=未填:undefined/null/空串(boolean 与数字 0 不算空,由各自分支处理) */
function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

/** pattern 为 JSON 字符串字面量,运行时编译;非法正则按 A6 拍板视为规则缺失 */
function tryCompilePattern(source: string): RegExp | null {
  try {
    return new RegExp(source)
  } catch {
    return null
  }
}
