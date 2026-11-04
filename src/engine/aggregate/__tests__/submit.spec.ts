import { describe, expect, it } from 'vitest'

import crossFieldSchema from '@/schema/examples/cross-field-validation.json'
import dynamicRenderingSchema from '@/schema/examples/dynamic-rendering.json'
import fieldLinkageSchema from '@/schema/examples/field-linkage.json'
import type { FormSchema } from '@/schema/types'

import { aggregateModules } from '../submit'
import type { ModuleInput } from '../submit'

const crossSchema = crossFieldSchema as FormSchema
const renderingSchema = dynamicRenderingSchema as FormSchema
const linkageSchema = fieldLinkageSchema as FormSchema

const validCross: ModuleInput = {
  key: 'account',
  title: '项目周期设置',
  schema: crossSchema,
  values: {
    password: 'abc12345',
    passwordConfirm: 'abc12345',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
  },
}

describe('engine/aggregate/submit', () => {
  it('全模块通过:canSubmit=true,payload 剔除未赋值键(birthday 未填不出现)', () => {
    // Arrange
    const modules: ModuleInput[] = [
      validCross,
      {
        key: 'profile',
        title: '会员注册',
        schema: renderingSchema,
        values: { nickname: '阿甲', age: 30, plan: 'pro' },
      },
    ]
    // Act
    const result = aggregateModules(modules)
    // Assert
    expect(result.canSubmit).toBe(true)
    expect(result.modules.every((module) => module.valid)).toBe(true)
    expect(result.payload['profile']).toEqual({ nickname: '阿甲', age: 30, plan: 'pro' })
  })

  it('局部失败:canSubmit=false,失败模块 errorCount/firstError 可定位', () => {
    // Arrange
    const modules: ModuleInput[] = [
      validCross,
      {
        key: 'profile',
        title: '会员注册',
        schema: renderingSchema,
        values: { nickname: '甲', age: 200, plan: 'pro' },
      },
    ]
    // Act
    const result = aggregateModules(modules)
    // Assert
    expect(result.canSubmit).toBe(false)
    const profile = result.modules.find((module) => module.key === 'profile')
    expect(profile?.valid).toBe(false)
    expect(profile?.errorCount).toBe(2)
    expect(profile?.firstError?.fieldKey).toBe('nickname')
  })

  it('隐藏字段值从提交载荷剔除(field-linkage:填过 platform 后切回 employed)', () => {
    // Arrange
    const devModule: ModuleInput = {
      key: 'dev',
      title: '开发者信息登记',
      schema: linkageSchema,
      values: { name: '张三', employmentStatus: 'employed', platform: 'upwork' },
    }
    // Act
    const result = aggregateModules([devModule])
    // Assert
    expect(result.payload['dev']).toEqual({ name: '张三', employmentStatus: 'employed' })
  })

  it('空模块数组:canSubmit=true(无失败即放行)', () => {
    // Act
    const result = aggregateModules([])
    // Assert
    expect(result.canSubmit).toBe(true)
    expect(result.modules).toEqual([])
    expect(result.payload).toEqual({})
  })

  it('payload 键=模块 key,模块状态携带标题(供聚合状态条展示)', () => {
    // Act
    const result = aggregateModules([validCross])
    // Assert
    expect(Object.keys(result.payload)).toEqual(['account'])
    expect(result.modules[0]).toMatchObject({ key: 'account', title: '项目周期设置', valid: true })
  })

  it('跨字段失败也能定位:firstError 指向挂载字段', () => {
    // Arrange
    const accountModule: ModuleInput = {
      key: 'account',
      title: '项目周期设置',
      schema: crossSchema,
      values: { password: 'abc12345', passwordConfirm: 'abc12346' },
    }
    // Act
    const result = aggregateModules([accountModule])
    // Assert
    expect(result.canSubmit).toBe(false)
    expect(result.modules[0]?.firstError).toMatchObject({
      fieldKey: 'passwordConfirm',
      message: '两次输入的密码不一致',
    })
  })
})
