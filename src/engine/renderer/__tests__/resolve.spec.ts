import { describe, expect, it } from 'vitest'

import dynamicRenderingSchema from '@/schema/examples/dynamic-rendering.json'
import fieldLinkageSchema from '@/schema/examples/field-linkage.json'
import nestedContainersSchema from '@/schema/examples/nested-containers.json'
import type { FormSchema } from '@/schema/types'

import { resolveRenderTree } from '../resolve'

const flatSchema = dynamicRenderingSchema as FormSchema
const linkageSchema = fieldLinkageSchema as FormSchema
const nestedSchema = nestedContainersSchema as FormSchema

/** 全可见集合:按 schema 全字段(含嵌套层)构造 */
function allVisible(schema: FormSchema): Set<string> {
  const keys = new Set<string>()
  const walk = (fields: FormSchema['fields']): void => {
    for (const field of fields) {
      keys.add(field.key)
      walk(field.fields ?? [])
    }
  }
  walk(schema.fields)
  return keys
}

describe('engine/renderer/resolve', () => {
  it('扁平 schema:全部产出 field 节点且保持声明顺序', () => {
    // Act
    const nodes = resolveRenderTree(flatSchema.fields, allVisible(flatSchema))
    // Assert
    expect(nodes.map((node) => node.kind)).toEqual(['field', 'field', 'field', 'field', 'field'])
    expect(
      nodes.every(
        (node, i) => node.kind === 'field' && node.field.key === flatSchema.fields[i]?.key,
      ),
    ).toBe(true)
  })

  it('嵌套容器:group/field 混排树形正确(nested 种子,两层 group)', () => {
    // Act
    const nodes = resolveRenderTree(nestedSchema.fields, allVisible(nestedSchema))
    // Assert
    expect(nodes.map((node) => node.kind)).toEqual(['field', 'field', 'group', 'group'])
    const schedule = nodes[2]
    if (schedule?.kind !== 'group') throw new Error('scheduleInfo 应为 group 节点')
    expect(schedule.field.key).toBe('scheduleInfo')
    expect(schedule.children.map((child) => child.kind)).toEqual(['field', 'group', 'field'])
    const extension = schedule.children[1]
    if (extension?.kind !== 'group') throw new Error('extension 应为 group 节点')
    expect(extension.children.map((child) => child.kind)).toEqual(['field', 'field'])
  })

  it('隐藏字段不产出节点(field-linkage:platform/monthlyIncome 隐藏)', () => {
    // Arrange:employmentStatus 未填,联动字段隐藏
    const visible = new Set(['name', 'employmentStatus'])
    // Act
    const nodes = resolveRenderTree(linkageSchema.fields, visible)
    // Assert
    expect(nodes.map((node) => node.field.key)).toEqual(['name', 'employmentStatus'])
  })

  it('隐藏容器整棵子树不产出(nested:outsourcingInfo 隐藏)', () => {
    // Arrange
    const visible = allVisible(nestedSchema)
    visible.delete('outsourcingInfo')
    // Act
    const nodes = resolveRenderTree(nestedSchema.fields, visible)
    // Assert
    expect(nodes.map((node) => node.kind)).toEqual(['field', 'field', 'group'])
    expect(nodes.some((node) => node.field.key === 'outsourcingInfo')).toBe(false)
  })

  it('可见容器内隐藏子字段被剔除(extension group 仅剩一个子节点)', () => {
    // Arrange:extensionReason 隐藏
    const visible = allVisible(nestedSchema)
    visible.delete('extensionReason')
    // Act
    const nodes = resolveRenderTree(nestedSchema.fields, visible)
    // Assert
    const schedule = nodes[2]
    if (schedule?.kind !== 'group') throw new Error('scheduleInfo 应为 group 节点')
    const extension = schedule.children[1]
    if (extension?.kind !== 'group') throw new Error('extension 应为 group 节点')
    expect(extension.children.map((child) => child.field.key)).toEqual(['hasExtension'])
  })
})
