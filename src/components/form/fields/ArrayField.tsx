'use client'

/**
 * array 字段控件:动态增删行 + 行内三型列输入(string/number/select)+ 逐格错误展示。
 * 出处:briefs 03——M2 UI 薄壳层;行操作走 reducer(ADD_ROW/REMOVE_ROW/UPDATE_CELL)。
 * 约束:行值为对象数组,列键即单元格键;输入任一格即触碰整字段(错误实时显示,修复轮 A1)。
 */
import type { ArrayColumn, FieldSchema } from '@/schema/types'
import type { ArrayRow } from '@/engine/core/types'

import type { UseFormEngineResult } from '../useFormEngine'
import styles from '../form.module.css'

export function ArrayField({
  field,
  engine,
  idPrefix = '',
}: {
  field: FieldSchema
  engine: UseFormEngineResult
  /** ID 命名空间(见 SchemaForm.idPrefix) */
  idPrefix?: string
}) {
  if (field.type !== 'array') return null
  const columns = field.columns ?? []
  const rows: ArrayRow[] = Array.isArray(engine.values[field.key])
    ? (engine.values[field.key] as ArrayRow[])
    : []
  const showError = engine.shouldShow(field.key)
  const errors = engine.fieldErrors(field.key)
  const fieldLevelErrors = errors.filter((error) => error.row === undefined)

  return (
    <fieldset
      className={styles['group']}
      id={`field-${idPrefix ? `${idPrefix}-` : ''}${field.key}`}
    >
      <legend className={styles['group-label']}>
        {field.label}
        {field.validation?.required === true ? <span className={styles['required']}>*</span> : null}
      </legend>
      {rows.length === 0 ? (
        <p className={styles['empty-row']}>暂无条目,点击下方按钮添加</p>
      ) : (
        <div className={styles['row-list']}>
          {rows.map((row, rowIndex) => (
            <div className={styles['row']} key={`row-${rowIndex}`}>
              <span className={styles['row-index']}>{rowIndex + 1}</span>
              {columns.map((column) => (
                <div className={styles['cell']} key={column.key}>
                  <CellInput
                    fieldKey={field.key}
                    rowIndex={rowIndex}
                    column={column}
                    value={row[column.key]}
                    engine={engine}
                  />
                  {showError
                    ? errors
                        .filter((error) => error.row === rowIndex && error.column === column.key)
                        .map((error, index) => (
                          <div key={index} className={styles['error']}>
                            {error.message}
                          </div>
                        ))
                    : null}
                </div>
              ))}
              <button
                type="button"
                className={styles['remove-button']}
                onClick={() => engine.removeRow(field.key, rowIndex)}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className={styles['add-button']}
        onClick={() => engine.addRow(field.key)}
      >
        + 添加一行
      </button>
      {showError
        ? fieldLevelErrors.map((error, index) => (
            <div key={index} className={styles['error']}>
              {error.message}
            </div>
          ))
        : null}
    </fieldset>
  )
}

function CellInput({
  fieldKey,
  rowIndex,
  column,
  value,
  engine,
}: {
  fieldKey: string
  rowIndex: number
  column: ArrayColumn
  value: unknown
  engine: UseFormEngineResult
}) {
  const ariaLabel = `第 ${rowIndex + 1} 行 ${column.label}`

  if (column.type === 'select') {
    return (
      <select
        className={styles['input']}
        aria-label={ariaLabel}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => engine.updateCell(fieldKey, rowIndex, column.key, event.target.value)}
        onBlur={() => engine.touchField(fieldKey)}
      >
        <option value="">请选择</option>
        {(column.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
  if (column.type === 'number') {
    return (
      <input
        className={styles['input']}
        type="number"
        aria-label={ariaLabel}
        value={typeof value === 'number' ? value : ''}
        onChange={(event) =>
          engine.updateCell(
            fieldKey,
            rowIndex,
            column.key,
            event.target.value === '' ? undefined : event.target.valueAsNumber,
          )
        }
        onBlur={() => engine.touchField(fieldKey)}
      />
    )
  }
  return (
    <input
      className={styles['input']}
      type="text"
      aria-label={ariaLabel}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => engine.updateCell(fieldKey, rowIndex, column.key, event.target.value)}
      onBlur={() => engine.touchField(fieldKey)}
    />
  )
}
