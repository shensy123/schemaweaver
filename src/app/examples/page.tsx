'use client'

/**
 * 示例库页:五份 schema 卡片(能力词 chip+三段式介绍:JSON 说明/使用场景/字段指引),
 * 「查看数据」弹窗三段结构(介绍固定+JSON 容器内滚+底部导航常驻),上一个/下一个循环回绕。
 * 出处:briefs 03 修复轮 2(2026-11-05 用户拍板方案,任务 1-4)。
 * 约束:介绍与指引按各 JSON 实写,不虚构能力;文案用户视角,术语加括号白话。
 */
import Link from 'next/link'
import { useState } from 'react'

import { JsonHighlight } from '@/components/json-highlight/JsonHighlight'
import { FormShell } from '@/components/form/shells/FormShell'
import crossField from '@/schema/examples/cross-field-validation.json'
import dynamicRendering from '@/schema/examples/dynamic-rendering.json'
import dynamicRows from '@/schema/examples/dynamic-rows.json'
import fieldLinkage from '@/schema/examples/field-linkage.json'
import nestedContainers from '@/schema/examples/nested-containers.json'

import styles from './examples.module.css'

interface ExampleCard {
  key: string
  order: string
  title: string
  chips: string[]
  mechanism: string
  scenario: string
  guide: string[]
  schema: unknown
}

const EXAMPLES: ExampleCard[] = [
  {
    key: 'dynamic-rendering',
    order: '①',
    title: '动态渲染 · 会员注册',
    chips: ['文本', '数字', '下拉', '开关', '日期'],
    mechanism:
      'fields 数组里每个对象就是一个表单字段——key 是存值用的名字、label 是界面上显示的名字、type 决定渲染成哪种控件。',
    scenario:
      '注册表单要加一个"推荐人"输入框,或把"年龄"从手填换成下拉,只改这份 JSON,一行组件代码都不用动。',
    guide: [
      'fields[1].type 从 number 改成 select 并补上 options 数组——"年龄"从输入框变成下拉框',
      'fields[4].type 从 date 改成 string——"生日"从日期控件变成普通文本框',
      '给任一字段加上 "validation": { "required": true }——该字段立即变必填(标签带红星)',
    ],
    schema: dynamicRendering,
  },
  {
    key: 'cross-field-validation',
    order: '②',
    title: '跨字段校验 · 项目周期设置',
    chips: ['密码一致', '日期先后'],
    mechanism:
      'crossFieldRules 数组声明字段之间的比较规则——match 要求两个字段的值相等、greaterThan 要求前者大于后者,失败提示挂在 field 指定的那个字段下面。',
    scenario:
      '活动报名表要求"确认密码"与密码一致、结束日期必须晚于开始日期——两条规则都写在 JSON 里,引擎统一求值,不用写校验代码。',
    guide: [
      'crossFieldRules[0].target 从 password 改成 startDate——确认密码改为和开始日期比大小(演示规则挂错目标的样子)',
      '把 crossFieldRules[1] 整条删掉——日期先后关系不再被校验',
      'fields[0].validation.minLength 从 8 改成 3——密码长度门槛立即降低',
    ],
    schema: crossField,
  },
  {
    key: 'field-linkage',
    order: '③',
    title: '字段联动 · 开发者信息登记',
    chips: ['条件显隐', '隐藏不校验'],
    mechanism:
      '字段上的 visibleWhen 声明"只有当某个字段等于指定值时我才出现";被隐藏的字段不参与校验,值也不会进提交数据。',
    scenario:
      '问卷只对自由职业者追问接单平台与月收入,其他人看不到这两题——按回答展开追问,答题干扰最少。',
    guide: [
      'fields[2].visibleWhen.equals 从 freelance 改成 employed——平台字段改为选"在职"时才出现',
      '删掉 fields[3].visibleWhen 整行——月收入变成任何就业状态下都可见',
      'fields[2].validation.required 改成 false(或整段删除)——平台字段出现后也不强制填写',
    ],
    schema: fieldLinkage,
  },
  {
    key: 'dynamic-rows',
    order: '④',
    title: '动态增删行 · 家庭成员登记',
    chips: ['行增删', '逐格校验'],
    mechanism:
      'type 为 array 的字段按 columns 描述渲染成可增删的表格行,每列独立声明控件类型与校验;行数由填表人点"+ 添加一行"自己决定。',
    scenario:
      '补贴申报要登记全部家庭成员——三口之家和六口之家填的行数不同,每行的姓名/关系/年龄逐格校验,缺一格当场报错。',
    guide: [
      'fields[1].columns[2].max 从 150 改成 12——年龄上限收紧,填超龄立即提示',
      'columns 里加一列 { "key": "phone", "label": "电话", "type": "string" }——每行多出一格电话输入',
      '把 fields[1].validation.required 删掉——允许一行家庭成员都不填',
    ],
    schema: dynamicRows,
  },
  {
    key: 'nested-containers',
    order: '⑤',
    title: '嵌套容器(v0.2)· 项目立项登记',
    chips: ['分组嵌套', '条件剪枝'],
    mechanism:
      'type 为 object 的字段是纯分组容器(自己的 fields 里再放子字段),组里还能继续套组和 array;带 visibleWhen 的组在条件不满足时整棵剪掉(连同里面所有内容)。',
    scenario:
      '立项审批表里"外包信息"整块只在项目类型选"外包"时出现——供应商名称、联系人表单一并显隐,自研项目完全看不到。',
    guide: [
      'fields[3].visibleWhen.equals 从 outsourced 改成 internal——外包信息改为选"自研"时才出现',
      '把 fields[2].fields[1](延期设置组)整块删掉——嵌套少一层,渲染立即变浅',
      'fields[2].fields[2].columns 里 budgetDays 列改 "type": "select" 并补 options——预算人日从数字输入变下拉',
    ],
    schema: nestedContainers,
  },
]

export default function ExamplesPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const active: ExampleCard | undefined = activeIndex === null ? undefined : EXAMPLES[activeIndex]

  const show = (index: number): void => {
    setActiveIndex(((index % EXAMPLES.length) + EXAMPLES.length) % EXAMPLES.length)
  }

  return (
    <main className={styles['page']}>
      <header className={styles['header']}>
        <Link href="/" className={styles['back']}>
          ← 返回导览
        </Link>
        <h1>Schema 能力示例</h1>
        <p className={styles['note']}>
          每张卡片是一份「表单图纸」(JSON
          数据):改图纸就能改表单。五张图纸分别演示字段怎么长出来、规则怎么写、条件怎么挂——想亲手填,去导览页进「表单全流程演示」。
        </p>
      </header>
      <div className={styles['grid']}>
        {EXAMPLES.map((example, index) => (
          <section key={example.key} className={styles['card']}>
            <h2 className={styles['card-title']}>
              <span className={styles['card-order']}>{example.order}</span>
              {example.title}
            </h2>
            <div className={styles['chip-row']}>
              {example.chips.map((chip) => (
                <span key={chip} className={styles['chip']}>
                  {chip}
                </span>
              ))}
            </div>
            <p className={styles['card-text']}>
              <span className={styles['card-lead']}>JSON 说明:</span>
              {example.mechanism}
            </p>
            <p className={styles['card-text']}>
              <span className={styles['card-lead']}>使用场景:</span>
              {example.scenario}
            </p>
            <ul className={styles['guide']}>
              {example.guide.map((item) => (
                <li key={item} className={styles['guide-item']}>
                  {item}
                </li>
              ))}
            </ul>
            <button type="button" className={styles['ghost-btn']} onClick={() => show(index)}>
              查看数据
            </button>
          </section>
        ))}
      </div>
      <FormShell
        variant="modal"
        title={active === undefined ? '' : `${active.order} ${active.title}`}
        open={active !== undefined}
        onClose={() => setActiveIndex(null)}
      >
        {active !== undefined ? (
          <div className={styles['viewer']}>
            <p className={styles['viewer-intro']}>
              <span className={styles['card-lead']}>JSON 说明:</span>
              {active.mechanism}
            </p>
            <pre className={styles['viewer-json']}>
              <JsonHighlight source={JSON.stringify(active.schema, null, 2)} />
            </pre>
            <div className={styles['viewer-nav']}>
              <button
                type="button"
                className={styles['ghost-btn']}
                onClick={() => show((activeIndex ?? 0) - 1)}
              >
                ← 上一个
              </button>
              <span className={styles['viewer-position']}>
                {(activeIndex ?? 0) + 1} / {EXAMPLES.length}
              </span>
              <button
                type="button"
                className={styles['ghost-btn']}
                onClick={() => show((activeIndex ?? 0) + 1)}
              >
                下一个 →
              </button>
            </div>
          </div>
        ) : null}
      </FormShell>
    </main>
  )
}
