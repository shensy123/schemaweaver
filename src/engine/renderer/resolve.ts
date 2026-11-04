/**
 * 渲染解析器:schema → RenderNode 树(递归展开 object 容器,按可见性剪枝)。
 * 出处:briefs 03——M2 渲染分块(D2 拍板:解析纯函数化,React 只做 dumb 映射,步骤 7 落地)。
 * 约束:节点不含 hidden 信息——剪掉的子树直接不产出;array 行结构由 UI 层消费 columns。
 */
import type { FieldSchema } from '@/schema/types'

export type RenderNode =
  | { kind: 'field'; field: FieldSchema }
  | { kind: 'group'; field: FieldSchema; children: RenderNode[] }

export function resolveRenderTree(fields: FieldSchema[], visibleKeys: Set<string>): RenderNode[] {
  const nodes: RenderNode[] = []
  for (const field of fields) {
    if (!visibleKeys.has(field.key)) continue
    if (field.type === 'object') {
      nodes.push({
        kind: 'group',
        field,
        children: resolveRenderTree(field.fields ?? [], visibleKeys),
      })
    } else {
      nodes.push({ kind: 'field', field })
    }
  }
  return nodes
}
