'use client'

/**
 * 标量字段控件壳:label/required 标记/错误展示 + 五型输入(string/number/boolean/select/date)。
 * 出处:briefs 03——M2 UI 薄壳层;值类型转换收敛在此,引擎只收原始值。
 * 约束:受控组件;错误仅在触碰或提交尝试后显示(engine.shouldShow 门槛)。
 */
import type { ReactNode } from 'react'

import type { FieldSchema } from '@/schema/types'

import type { UseFormEngineResult } from '../useFormEngine'
import styles from '../form.module.css'

export function FieldControl({
  field,
  engine,
}: {
  field: FieldSchema
  engine: UseFormEngineResult
}) {
  const value = engine.values[field.key]
  const showError = engine.shouldShow(field.key)
  const errors = engine.fieldErrors(field.key)
  const inputId = `field-${field.key}-input`

  return (
    <div className={styles['field']} id={`field-${field.key}`}>
      <label className={styles['label']} htmlFor={inputId}>
        {field.label}
        {field.validation?.required === true ? <span className={styles['required']}>*</span> : null}
      </label>
      <div className={styles['control']}>
        {renderInput(field, value, engine, inputId)}
        {showError
          ? errors.map((error, index) => (
              <div key={index} className={styles['error']}>
                {error.message}
              </div>
            ))
          : null}
      </div>
    </div>
  )
}

function renderInput(
  field: FieldSchema,
  value: unknown,
  engine: UseFormEngineResult,
  inputId: string,
): ReactNode {
  switch (field.type) {
    case 'string':
      return (
        <input
          id={inputId}
          className={styles['input']}
          type="text"
          placeholder={field.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => engine.setField(field.key, event.target.value)}
          onBlur={() => engine.touchField(field.key)}
        />
      )
    case 'number':
      return (
        <input
          id={inputId}
          className={styles['input']}
          type="number"
          placeholder={field.placeholder}
          value={typeof value === 'number' ? value : ''}
          onChange={(event) =>
            engine.setField(
              field.key,
              event.target.value === '' ? undefined : event.target.valueAsNumber,
            )
          }
          onBlur={() => engine.touchField(field.key)}
        />
      )
    case 'boolean':
      return (
        <input
          id={inputId}
          className={styles['checkbox']}
          type="checkbox"
          checked={value === true}
          onChange={(event) => engine.setField(field.key, event.target.checked)}
          onBlur={() => engine.touchField(field.key)}
        />
      )
    case 'select':
      return (
        <select
          id={inputId}
          className={styles['input']}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => engine.setField(field.key, event.target.value)}
          onBlur={() => engine.touchField(field.key)}
        >
          <option value="">请选择</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    case 'date':
      return (
        <input
          id={inputId}
          className={styles['input']}
          type="date"
          value={typeof value === 'string' ? value : ''}
          onChange={(event) =>
            engine.setField(field.key, event.target.value === '' ? undefined : event.target.value)
          }
          onBlur={() => engine.touchField(field.key)}
        />
      )
    case 'array':
    case 'object':
      return null // array 由 ArrayField 渲染;object 容器由 SchemaForm 处理,不经此组件
  }
}
