import { describe, expect, it } from 'vitest'

import crossFieldSchema from '@/schema/examples/cross-field-validation.json'
import type { CrossFieldRule, FormSchema } from '@/schema/types'

import { evaluateCrossRules } from '../cross-field'

const schema = crossFieldSchema as FormSchema
const rules: CrossFieldRule[] = schema.crossFieldRules ?? []
const allVisible = new Set(['password', 'passwordConfirm', 'startDate', 'endDate'])

describe('engine/validation/cross-field', () => {
  it('match:两值相等通过(cross-field-validation 种子)', () => {
    // Act
    const errors = evaluateCrossRules(
      rules,
      { password: 'abc12345', passwordConfirm: 'abc12345' },
      allVisible,
    )
    // Assert
    expect(errors).toEqual([])
  })

  it('match:不一致失败,错误挂载到 rule.field(passwordConfirm)', () => {
    // Act
    const errors = evaluateCrossRules(
      rules,
      { password: 'abc12345', passwordConfirm: 'abc12346' },
      allVisible,
    )
    // Assert
    expect(errors).toEqual([{ fieldKey: 'passwordConfirm', message: '两次输入的密码不一致' }])
  })

  it('greaterThan:ISO 日期字符串字典序比较,结束晚于开始通过', () => {
    // Act
    const errors = evaluateCrossRules(
      rules,
      { startDate: '2026-01-01', endDate: '2026-02-01' },
      allVisible,
    )
    // Assert
    expect(errors).toEqual([])
  })

  it('greaterThan:结束早于开始失败,挂 endDate', () => {
    // Act
    const errors = evaluateCrossRules(
      rules,
      { startDate: '2026-03-01', endDate: '2026-02-01' },
      allVisible,
    )
    // Assert
    expect(errors).toEqual([{ fieldKey: 'endDate', message: '结束日期必须晚于开始日期' }])
  })

  it('greaterThan:相等不算"晚于",失败', () => {
    // Act
    const errors = evaluateCrossRules(
      rules,
      { startDate: '2026-03-01', endDate: '2026-03-01' },
      allVisible,
    )
    // Assert
    expect(errors).toEqual([{ fieldKey: 'endDate', message: '结束日期必须晚于开始日期' }])
  })

  it('任一端空值跳过规则(A3):必填性由字段级规则负责', () => {
    // Act
    const errors = evaluateCrossRules(
      rules,
      {
        password: 'abc12345',
        passwordConfirm: undefined,
        startDate: undefined,
        endDate: '2026-02-01',
      },
      allVisible,
    )
    // Assert
    expect(errors).toEqual([])
  })

  it('任一端点字段隐藏则跳过规则(A4)', () => {
    // Arrange:password 不可见
    const visible = new Set(['passwordConfirm', 'startDate', 'endDate'])
    // Act
    const errors = evaluateCrossRules(
      rules,
      {
        password: 'abc12345',
        passwordConfirm: 'abc12346',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      },
      visible,
    )
    // Assert
    expect(errors).toEqual([])
  })
})
