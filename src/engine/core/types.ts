/**
 * 引擎核心数据类型:表单运行时状态与错误结构。
 * 出处:briefs 03——M2 引擎逻辑层分块(core/linkage/validation/renderer/aggregate)。
 * 约束:纯数据定义,零 React 依赖;错误不进状态,由 values+schema 现算(D5 无派生缓存)。
 */
import type { FormValues } from '@/schema/types'

/** 单条字段错误:可定位到 array 字段的行与列 */
export interface FieldError {
  /** 出错字段 key(全表单扁平唯一,v0.2 嵌套容器不引入层级) */
  fieldKey: string
  message: string
  /** array 字段专属:出错行号(0 起) */
  row?: number
  /** array 字段专属:出错列 key */
  column?: string
}

/** array 字段的行值:列 key → 值 */
export type ArrayRow = Record<string, unknown>

/** 表单运行时状态(reducer 持有) */
export interface FormState {
  values: FormValues
  /** 字段 key → 是否已触碰(失焦/提交后为 true,控制错误显示时机) */
  touched: Record<string, boolean>
  /** 是否发生过提交尝试(为 true 时全部错误可见) */
  submitted: boolean
}
