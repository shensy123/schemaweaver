/**
 * SchemaWeaver Schema v0.2 类型定义
 *
 * 设计原则:schema 是纯数据(JSON 可序列化),引擎负责一切行为。
 * 只描述"表单长什么样、怎么校验、怎么联动",不含任何逻辑代码。
 * 出处:briefs 01——schema v0.1 类型定稿;briefs 03——v0.2 嵌套容器扩展
 * (2026-11-04 拍板):新增 object 容器型与 fields 嵌套;字段 key 全表单扁平唯一,
 * 值模型与 v0.1 兼容(容器不产生值层级)。
 */

/** 控件类型 */
export type FieldType =
  | 'string' // 单行文本
  | 'number' // 数字输入
  | 'boolean' // 开关/勾选
  | 'select' // 下拉单选
  | 'date' // 日期(值为 ISO 字符串 YYYY-MM-DD)
  | 'array' // 动态增删行(值为对象数组,行结构由 columns 描述)
  | 'object' // 容器分组(自身不产生值,仅组织渲染层级;子字段由 fields 描述)

export interface FieldOption {
  label: string
  value: string
}

/** 单字段校验:只看本字段自己的值 */
export interface ValidationRule {
  required?: boolean
  minLength?: number // string:最小长度
  maxLength?: number // string:最大长度
  min?: number // number:最小值
  max?: number // number:最大值
  pattern?: string // string:正则字面量(JSON 里不能放 RegExp 对象)
  message?: string // 失败提示文案;缺省时引擎用内置默认文案
}

/** 字段联动:条件显隐 */
export interface VisibleWhen {
  /** 依赖的字段 key */
  field: string
  /** 依赖字段等于该值时,本字段才显示 */
  equals: string | number | boolean
}

/** array 类型字段的一列(行内控件) */
export interface ArrayColumn {
  key: string
  label: string
  type: 'string' | 'number' | 'select'
  /** type 为 select 时必填 */
  options?: FieldOption[]
  validation?: ValidationRule
}

/** 字段定义 */
export interface FieldSchema {
  /** 字段名:作为表单值的键,全表单内唯一 */
  key: string
  label: string
  type: FieldType
  placeholder?: string
  /** type 为 select 时必填 */
  options?: FieldOption[]
  validation?: ValidationRule
  /**
   * 字段联动:条件显隐。
   * v0.1 约定:隐藏的字段不参与校验,值从提交数据中剔除。
   */
  visibleWhen?: VisibleWhen
  /** type 为 array 时必填:行内列定义 */
  columns?: ArrayColumn[]
  /** type 为 object 时必填:子字段列表(可继续嵌套 object/array;key 仍须全表单唯一) */
  fields?: FieldSchema[]
  /**
   * 输入形态覆写(修复轮 3,2026-11-05 拍板):v0.2 仅 password——
   * string 型字段渲染为掩码输入,值语义不变(仍是明文字符串)。
   */
  inputType?: 'password'
}

/**
 * 跨字段校验规则(v0.1 只声明两种原语,够覆盖示例):
 * - match        field 的值必须 === target 的值
 * - greaterThan  field 的值必须 > target 的值(number 或 ISO 日期字符串)
 */
export interface CrossFieldRule {
  type: 'match' | 'greaterThan'
  /** 校验失败时,错误信息挂载到哪个字段上 */
  field: string
  /** 被比较的另一个字段 key */
  target: string
  message: string
}

/** 表单值:键与 FieldSchema.key 对应 */
export type FormValues = Record<string, unknown>

/** 表单 Schema 顶层结构 */
export interface FormSchema {
  /** schema 版本号,为将来迁移留钩子;v0.2 为 v0.1 超集(v0.1 schema 依然合法) */
  version: '0.1' | '0.2'
  title: string
  description?: string
  fields: FieldSchema[]
  crossFieldRules?: CrossFieldRule[]
}
