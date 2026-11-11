import { describe, expect, it } from 'vitest'

import { evaluateVisibility } from '@/engine/linkage/visibility'
import crossFieldSchema from '@/schema/examples/cross-field-validation.json'
import dynamicRowsSchema from '@/schema/examples/dynamic-rows.json'
import fieldLinkageSchema from '@/schema/examples/field-linkage.json'
import nestedContainersSchema from '@/schema/examples/nested-containers.json'
import type { FormSchema } from '@/schema/types'

import { validateForm } from '../form'

const crossSchema = crossFieldSchema as FormSchema
const linkageSchema = fieldLinkageSchema as FormSchema
const rowsSchema = dynamicRowsSchema as FormSchema
const nestedSchema = nestedContainersSchema as FormSchema

/** 单模块校验 = 可见性求值 + 表单校验(与 aggregate 内部编排一致) */
function check(schema: FormSchema, values: Record<string, unknown>) {
  const { visibleKeys } = evaluateVisibility(schema.fields, values)
  return validateForm(schema, values, visibleKeys)
}

describe('engine/validation/form', () => {
  it('全对通过:cross-field 种子填满且满足跨字段规则', () => {
    // Act
    const result = check(crossSchema, {
      password: 'abc12345',
      passwordConfirm: 'abc12345',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
    })
    // Assert
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('字段级与跨字段错误同时汇总:短密码+两次不一致', () => {
    // Act
    const result = check(crossSchema, { password: 'short', passwordConfirm: 'other' })
    // Assert
    expect(result.valid).toBe(false)
    const keys = result.errors.map((error) => error.fieldKey)
    expect(keys).toContain('password')
    expect(keys).toContain('passwordConfirm')
  })

  it('隐藏字段不参与校验(field-linkage:employed 时 platform 必填不生效)', () => {
    // Act
    const result = check(linkageSchema, { name: '张三', employmentStatus: 'employed' })
    // Assert
    expect(result.valid).toBe(true)
  })

  it('显示后必填生效:freelance 但未填 platform/monthlyIncome 则失败', () => {
    // Act
    const result = check(linkageSchema, { name: '张三', employmentStatus: 'freelance' })
    // Assert
    expect(result.valid).toBe(false)
    expect(result.errorKeys.has('platform')).toBe(true)
    expect(result.errorKeys.has('monthlyIncome')).toBe(true)
  })

  it('动态增删行:空行集触发 required;行内缺列定位到行列', () => {
    // Arrange
    const empty = check(rowsSchema, { ownerName: '张三' })
    // Act
    const withRow = check(rowsSchema, {
      ownerName: '张三',
      familyMembers: [{ name: '李四', age: 5 }],
    })
    // Assert
    expect(empty.valid).toBe(false)
    expect(empty.errors[0]?.message).toBe('至少添加一行')
    expect(withRow.valid).toBe(false)
    expect(withRow.errors).toEqual([
      { fieldKey: 'familyMembers', message: '必填项', row: 0, column: 'relationship' },
    ])
  })

  it('嵌套容器:隐藏容器内必填字段不校验;容器显示后生效(nested 种子)', () => {
    // Arrange
    const hidden = check(nestedSchema, { projectName: '甲乙', projectType: 'internal' })
    const shown = check(nestedSchema, { projectName: '甲乙', projectType: 'outsourced' })
    // Assert
    expect(hidden.valid).toBe(true)
    expect(shown.valid).toBe(false)
    expect(shown.errorKeys.has('vendorName')).toBe(true)
  })

  it('嵌套容器内字段自身条件隐藏也不校验(extensionReason 随 hasExtension)', () => {
    // Arrange:hasExtension 未勾,延期原因必填不生效
    const off = check(nestedSchema, { projectName: '甲乙', projectType: 'internal' })
    const on = check(nestedSchema, {
      projectName: '甲乙',
      projectType: 'internal',
      hasExtension: true,
    })
    // Assert
    expect(off.errorKeys.has('extensionReason')).toBe(false)
    expect(on.errorKeys.has('extensionReason')).toBe(true)
  })

  it('errorKeys 与 errors 的 fieldKey 一致汇总', () => {
    // Act
    const result = check(linkageSchema, { employmentStatus: 'freelance' })
    // Assert
    const keysFromErrors = new Set(result.errors.map((error) => error.fieldKey))
    expect(result.errorKeys).toEqual(keysFromErrors)
  })
})
