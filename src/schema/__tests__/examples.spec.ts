import { describe, expect, it } from 'vitest'

import type { FieldSchema, FormSchema } from '../types'
import crossField from '../examples/cross-field-validation.json'
import dynamicRendering from '../examples/dynamic-rendering.json'
import dynamicRows from '../examples/dynamic-rows.json'
import fieldLinkage from '../examples/field-linkage.json'

// JSON 导入是数据边界:TS 推断为宽类型,结构正确性由下方运行时断言兜底
const examples: ReadonlyArray<{ name: string; schema: FormSchema }> = [
  { name: 'dynamic-rendering', schema: dynamicRendering as FormSchema },
  { name: 'cross-field-validation', schema: crossField as FormSchema },
  { name: 'field-linkage', schema: fieldLinkage as FormSchema },
  { name: 'dynamic-rows', schema: dynamicRows as FormSchema },
]

const FIELD_TYPES = ['string', 'number', 'boolean', 'select', 'date', 'array']
const COLUMN_TYPES = ['string', 'number', 'select']

function fieldsOf(schema: FormSchema): FieldSchema[] {
  return schema.fields
}

describe('src/schema/examples 自洽性', () => {
  it('四份示例均为 v0.1,且含标题与非空字段列表', () => {
    // Assert
    for (const { name, schema } of examples) {
      expect(schema.version, `${name} 的 version`).toBe('0.1')
      expect(schema.title, `${name} 的 title`).toBeTruthy()
      expect(fieldsOf(schema).length, `${name} 的 fields`).toBeGreaterThan(0)
    }
  })

  it('字段 key 在各表单内唯一', () => {
    // Assert
    for (const { name, schema } of examples) {
      const keys = fieldsOf(schema).map((f) => f.key)
      expect(new Set(keys).size, `${name} 的字段 key`).toBe(keys.length)
    }
  })

  it('字段 type 与 v0.1 枚举闭合(不含未知类型)', () => {
    // Assert
    for (const { name, schema } of examples) {
      for (const field of fieldsOf(schema)) {
        expect(FIELD_TYPES, `${name}.${field.key} 的 type`).toContain(field.type)
      }
    }
  })

  it('select 字段均携带非空 options', () => {
    // Assert
    for (const { name, schema } of examples) {
      for (const field of fieldsOf(schema)) {
        if (field.type === 'select') {
          expect(field.options, `${name}.${field.key} 的 options`).toBeTruthy()
          expect(field.options?.length, `${name}.${field.key} 的 options`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('array 字段均携带 columns,且列 key 行内唯一、类型闭合', () => {
    // Assert
    for (const { name, schema } of examples) {
      for (const field of fieldsOf(schema)) {
        if (field.type !== 'array') continue
        expect(field.columns, `${name}.${field.key} 的 columns`).toBeTruthy()
        const colKeys = field.columns?.map((c) => c.key) ?? []
        expect(new Set(colKeys).size, `${name}.${field.key} 的列 key`).toBe(colKeys.length)
        for (const column of field.columns ?? []) {
          expect(COLUMN_TYPES, `${name}.${field.key}.${column.key} 的 type`).toContain(column.type)
        }
      }
    }
  })

  it('crossFieldRules 引用的 field 与 target 均存在于字段列表(无悬空引用)', () => {
    // Assert
    for (const { name, schema } of examples) {
      const keys = new Set(fieldsOf(schema).map((f) => f.key))
      for (const rule of schema.crossFieldRules ?? []) {
        expect(keys.has(rule.field), `${name} 规则挂载字段 ${rule.field}`).toBe(true)
        expect(keys.has(rule.target), `${name} 规则比较字段 ${rule.target}`).toBe(true)
      }
    }
  })

  it('visibleWhen.field 引用均存在于字段列表(无悬空引用)', () => {
    // Assert
    for (const { name, schema } of examples) {
      const keys = new Set(fieldsOf(schema).map((f) => f.key))
      for (const field of fieldsOf(schema)) {
        if (!field.visibleWhen) continue
        expect(
          keys.has(field.visibleWhen.field),
          `${name}.${field.key} 联动依赖 ${field.visibleWhen.field}`,
        ).toBe(true)
      }
    }
  })
})
