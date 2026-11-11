'use client'

/**
 * JSON 语法高亮:键/字符串/布尔空值/数字四类着色(消费仓库自有 JSON,无注入面)。
 * 出处:briefs 03 修复轮 2——自 examples 页抽公共组件(示例库弹窗/flow 提交成功弹窗共用)。
 * 约束:纯展示零状态;类名走 token 配色(json-highlight.module.css)。
 */
import type { ReactNode } from 'react'

import styles from './json-highlight.module.css'

const TOKEN_RE =
  /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?)/g

export function JsonHighlight({ source }: { source: string }): ReactNode {
  const nodes: ReactNode[] = []
  let last = 0
  let seq = 0
  for (const match of source.matchAll(TOKEN_RE)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(source.slice(last, start))
    const kind =
      match[1] !== undefined
        ? 'key'
        : match[2] !== undefined
          ? 'string'
          : match[3] !== undefined
            ? 'bool'
            : 'number'
    nodes.push(
      <span key={`token-${seq++}`} className={styles[`token-${kind}`]}>
        {match[0]}
      </span>,
    )
    last = start + match[0].length
  }
  if (last < source.length) nodes.push(source.slice(last))
  return <>{nodes}</>
}
