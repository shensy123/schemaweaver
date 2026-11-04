import { describe, expect, it } from 'vitest'

import { validateRule } from '../field-rule'

describe('engine/validation/field-rule', () => {
  it('required:空值(undefined/null/空串)失败,默认文案"必填项";自定义 message 优先', () => {
    // Assert
    expect(validateRule({ required: true }, undefined)).toBe('必填项')
    expect(validateRule({ required: true }, null)).toBe('必填项')
    expect(validateRule({ required: true }, '')).toBe('必填项')
    expect(validateRule({ required: true, message: '此项不可为空' }, '')).toBe('此项不可为空')
  })

  it('required + boolean:须为 true(A1);false 失败、true 通过、非 required 的 false 通过', () => {
    // Assert
    expect(validateRule({ required: true }, false)).toBe('必填项')
    expect(validateRule({ required: true }, true)).toBeNull()
    expect(validateRule({}, false)).toBeNull()
  })

  it('required 通过路径:非空字符串与数字 0 均视为已填', () => {
    // Assert
    expect(validateRule({ required: true }, '甲')).toBeNull()
    expect(validateRule({ required: true }, 0)).toBeNull()
  })

  it('minLength/maxLength:边界判定与默认文案;恰好等于边界通过', () => {
    // Assert
    expect(validateRule({ minLength: 2 }, '甲')).toBe('最少 2 个字符')
    expect(validateRule({ minLength: 2 }, '甲乙')).toBeNull()
    expect(validateRule({ maxLength: 5 }, '甲乙丙丁戊己')).toBe('最多 5 个字符')
    expect(validateRule({ maxLength: 5 }, '甲乙丙丁戊')).toBeNull()
  })

  it('min/max:数字边界判定与默认文案', () => {
    // Assert
    expect(validateRule({ min: 0 }, -1)).toBe('不能小于 0')
    expect(validateRule({ min: 0 }, 0)).toBeNull()
    expect(validateRule({ max: 150 }, 151)).toBe('不能大于 150')
    expect(validateRule({ max: 150 }, 150)).toBeNull()
  })

  it('pattern:匹配通过、不匹配失败;自定义 message 优先', () => {
    // Assert
    expect(validateRule({ pattern: '^1\\d{10}$' }, '13800138000')).toBeNull()
    expect(validateRule({ pattern: '^1\\d{10}$' }, '12345')).toBe('格式不正确')
    expect(validateRule({ pattern: '^1\\d{10}$', message: '手机号格式错误' }, '12345')).toBe(
      '手机号格式错误',
    )
  })

  it('空值跳过区间与格式规则(A2):undefined/空串不触发 minLength/min/pattern', () => {
    // Assert
    expect(validateRule({ minLength: 5 }, undefined)).toBeNull()
    expect(validateRule({ min: 10 }, undefined)).toBeNull()
    expect(validateRule({ pattern: '^a' }, undefined)).toBeNull()
    expect(validateRule({ minLength: 5 }, '')).toBeNull()
  })

  it('非法正则视为规则缺失(A6),不抛异常', () => {
    // Act
    const result = validateRule({ pattern: '([unclosed' }, '任意值')
    // Assert
    expect(result).toBeNull()
  })

  it('规则缺省(空对象)任何值都通过', () => {
    // Assert
    expect(validateRule({}, 'x')).toBeNull()
    expect(validateRule({}, undefined)).toBeNull()
  })
})
