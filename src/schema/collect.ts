/**
 * schema 递归遍历工具:v0.2 嵌套容器的字段收集。
 * 出处:briefs 03——v0.2 拍板第 4 点(自洽测试递归收集断言);引擎消费侧同算法单一来源。
 * 约束:深度优先展开 object 容器;array 行内列(ArrayColumn)不属字段,不收集。
 */
import type { FieldSchema } from './types'

/** 深度优先递归收集全部字段(含 object 容器自身与其子字段) */
export function collectFields(fields: FieldSchema[]): FieldSchema[] {
  return fields.flatMap((field) => [field, ...collectFields(field.fields ?? [])])
}
