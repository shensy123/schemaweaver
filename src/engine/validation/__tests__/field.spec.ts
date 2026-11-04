import { describe, expect, it } from 'vitest'

import type { FieldSchema } from '@/schema/types'

import { validateField } from '../field'

const textField: FieldSchema = {
  key: 'nickname',
  label: '昵称',
  type: 'string',
  validation: { required: true, minLength: 2 },
}

const arrayField: FieldSchema = {
  key: 'members',
  label: '成员',
  type: 'array',
  validation: { required: true },
  columns: [
    { key: 'name', label: '姓名', type: 'string', validation: { required: true } },
    { key: 'age', label: '年龄', type: 'number', validation: { min: 0 } },
  ],
}

describe('engine/validation/field', () => {
  it('普通字段失败:返回带 fieldKey 的单条错误', () => {
    // Act
    const errors = validateField(textField, '甲')
    // Assert
    expect(errors).toEqual([{ fieldKey: 'nickname', message: '最少 2 个字符' }])
  })

  it('普通字段通过:返回空数组', () => {
    // Act
    const errors = validateField(textField, '甲乙')
    // Assert
    expect(errors).toEqual([])
  })

  it('array 必填:undefined 与空行集均失败,默认文案"至少添加一行"', () => {
    // Assert
    expect(validateField(arrayField, undefined)).toEqual([
      { fieldKey: 'members', message: '至少添加一行' },
    ])
    expect(validateField(arrayField, [])).toEqual([
      { fieldKey: 'members', message: '至少添加一行' },
    ])
  })

  it('array 行列错误:定位到出错行号与列 key', () => {
    // Arrange:第 2 行缺姓名、年龄为负
    const rows = [{ name: '甲', age: 20 }, { age: -1 }]
    // Act
    const errors = validateField(arrayField, rows)
    // Assert
    expect(errors).toEqual([
      { fieldKey: 'members', message: '必填项', row: 1, column: 'name' },
      { fieldKey: 'members', message: '不能小于 0', row: 1, column: 'age' },
    ])
  })

  it('object 容器自身无校验语义,返回空数组', () => {
    // Arrange
    const container: FieldSchema = { key: 'group', label: '分组', type: 'object', fields: [] }
    // Act & Assert
    expect(validateField(container, undefined)).toEqual([])
  })
})
