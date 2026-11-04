import { describe, expect, it } from 'vitest'

import { collectFields } from '@/schema/collect'
import dynamicRendering from '@/schema/examples/dynamic-rendering.json'
import fieldLinkage from '@/schema/examples/field-linkage.json'
import nestedContainers from '@/schema/examples/nested-containers.json'
import type { FormSchema } from '@/schema/types'

import { evaluateVisibility } from '../visibility'

const linkageSchema = fieldLinkage as FormSchema
const nestedSchema = nestedContainers as FormSchema

describe('engine/linkage/visibility', () => {
  it('无 visibleWhen 的字段全部可见(dynamic-rendering 种子)', () => {
    // Arrange
    const schema = dynamicRendering as FormSchema
    // Act
    const { visibleKeys, hiddenKeys } = evaluateVisibility(schema.fields, {})
    // Assert
    expect(visibleKeys.size).toBe(5)
    expect(hiddenKeys.size).toBe(0)
  })

  it('equals 匹配 string:依赖命中才显示,未填/不匹配则隐藏(field-linkage 种子)', () => {
    // Act & Assert
    const empty = evaluateVisibility(linkageSchema.fields, {})
    expect(empty.hiddenKeys.has('platform')).toBe(true)
    const mismatch = evaluateVisibility(linkageSchema.fields, { employmentStatus: 'employed' })
    expect(mismatch.hiddenKeys.has('monthlyIncome')).toBe(true)
    const matched = evaluateVisibility(linkageSchema.fields, { employmentStatus: 'freelance' })
    expect(matched.visibleKeys.has('platform')).toBe(true)
    expect(matched.visibleKeys.has('monthlyIncome')).toBe(true)
  })

  it('equals 匹配 boolean:嵌套容器内字段联动(nested 种子)', () => {
    // Act
    const on = evaluateVisibility(nestedSchema.fields, { hasExtension: true })
    const off = evaluateVisibility(nestedSchema.fields, { hasExtension: false })
    // Assert
    expect(on.visibleKeys.has('extensionReason')).toBe(true)
    expect(off.hiddenKeys.has('extensionReason')).toBe(true)
  })

  it('隐藏容器整棵子树剪枝:后代不再求值自身条件,全部计入 hidden(A5)', () => {
    // Arrange:projectType 未填,outsourcingInfo 隐藏
    // Act
    const { visibleKeys, hiddenKeys } = evaluateVisibility(nestedSchema.fields, {})
    // Assert
    expect(hiddenKeys.has('outsourcingInfo')).toBe(true)
    expect(hiddenKeys.has('vendorName')).toBe(true)
    expect(hiddenKeys.has('vendorContacts')).toBe(true)
    expect(visibleKeys.has('vendorName')).toBe(false)
  })

  it('容器可见但其内字段可因自身条件隐藏(scheduleInfo 可见+extensionReason 隐藏)', () => {
    // Act
    const { visibleKeys, hiddenKeys } = evaluateVisibility(nestedSchema.fields, {
      projectType: 'internal',
    })
    // Assert
    expect(visibleKeys.has('scheduleInfo')).toBe(true)
    expect(visibleKeys.has('extension')).toBe(true)
    expect(hiddenKeys.has('extensionReason')).toBe(true)
  })

  it('visible 与 hidden 恰好互补覆盖全部字段 key', () => {
    // Arrange
    const total = collectFields(nestedSchema.fields).length
    // Act
    const { visibleKeys, hiddenKeys } = evaluateVisibility(nestedSchema.fields, {
      projectType: 'outsourced',
      hasExtension: true,
    })
    // Assert
    expect(visibleKeys.size + hiddenKeys.size).toBe(total)
    for (const key of visibleKeys) {
      expect(hiddenKeys.has(key), `key ${key} 不应同时出现在两侧`).toBe(false)
    }
  })

  it('依赖值切换时可见性随之翻转(纯函数无状态,两次求值独立)', () => {
    // Act
    const before = evaluateVisibility(linkageSchema.fields, { employmentStatus: 'employed' })
    const after = evaluateVisibility(linkageSchema.fields, { employmentStatus: 'freelance' })
    // Assert
    expect(before.hiddenKeys.has('platform')).toBe(true)
    expect(after.visibleKeys.has('platform')).toBe(true)
  })

  it('跨层引用:容器自身条件可依赖顶层字段(扁平 key)', () => {
    // Arrange:外包信息容器的条件依赖顶层 projectType
    // Act
    const { visibleKeys } = evaluateVisibility(nestedSchema.fields, { projectType: 'outsourced' })
    // Assert
    expect(visibleKeys.has('outsourcingInfo')).toBe(true)
    expect(visibleKeys.has('vendorName')).toBe(true)
  })
})
